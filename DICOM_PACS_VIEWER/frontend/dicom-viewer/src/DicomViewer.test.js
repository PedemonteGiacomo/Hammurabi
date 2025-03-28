// DicomViewer.test.js
import React from 'react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import axios from 'axios';

// We will mock axios calls to avoid real HTTP requests
jest.mock('axios');

// 2) Provide a DEFAULT resolved promise for cornerstone.loadImage
jest.mock('cornerstone-core', () => {
    return {
        enable: jest.fn(),
        // Always return a Promise.then(...)
        loadImage: jest.fn(() => Promise.resolve({ /* fake image object */ })),
        displayImage: jest.fn(),
    };
});

// 3) Mock the wadoImageLoader to avoid real DICOM parsing
jest.mock('cornerstone-wado-image-loader', () => ({
    external: { cornerstone: {}, dicomParser: {} },
    wadouri: { dataSetCacheManager: { get: jest.fn() } },
}));

import viewerReducer from './ViewerSlice';
import DicomViewer from './DicomViewer';
import cornerstone from 'cornerstone-core';
import cornerstoneWADOImageLoader from 'cornerstone-wado-image-loader';

describe('DicomViewer Component Tests', () => {
    let store;

    beforeEach(() => {
        store = configureStore({
            reducer: { viewer: viewerReducer },
        });
        jest.clearAllMocks();
    });

    it('renders the search UI and an empty viewer area initially', () => {
        render(
            <Provider store={store}>
                <DicomViewer />
            </Provider>
        );

        // The text field and button
        expect(screen.getByLabelText(/Patient ID/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Search/i })).toBeInTheDocument();

        // If images is 0, we expect no "Showing image..."
        // (IMPORTANT: only if you conditionally render it)
        expect(screen.queryByText(/Showing image/i)).toBeNull();
    });

    it('dispatches fetchImages when "Search" is clicked with a non-empty Patient ID', async () => {
        // We'll spy on store.dispatch to see which actions get dispatched
        const dispatchSpy = jest.spyOn(store, 'dispatch');

        render(
            <Provider store={store}>
                <DicomViewer />
            </Provider>
        );

        // Type a Patient ID
        fireEvent.change(screen.getByLabelText(/Patient ID/i), {
            target: { value: 'PATIENT_123' },
        });

        // Click "Search"
        fireEvent.click(screen.getByRole('button', { name: /Search/i }));

        // We expect an async action with type 'viewer/fetchImages/pending'
        await waitFor(() => {
            expect(dispatchSpy).toHaveBeenCalled();
        });

        // Because we never mock axios's response here, the fetch might fail.
        // But we verified the component triggers the action at least.
    });

    it('shows "Loading..." while fetchImages is in progress', async () => {
        // Mock the axios request to simulate a pending state
        axios.get.mockResolvedValueOnce({ data: { images: ['url1.dcm'] } });

        render(
            <Provider store={store}>
                <DicomViewer />
            </Provider>
        );

        // Enter a Patient ID & click Search
        fireEvent.change(screen.getByLabelText(/Patient ID/i), {
            target: { value: 'PATIENT_123' },
        });
        fireEvent.click(screen.getByRole('button', { name: /Search/i }));

        // "Loading..." should appear
        expect(screen.getByText(/Loading/i)).toBeInTheDocument();

        // Wait for the fetch to finish
        await waitFor(() =>
            expect(screen.queryByText(/Loading/i)).toBeNull()
        );
    });

    it('shows an error message if fetchImages fails', async () => {
        // Mock a failure from axios
        axios.get.mockRejectedValueOnce({
            response: { data: { error: 'Not found' } },
        });

        render(
            <Provider store={store}>
                <DicomViewer />
            </Provider>
        );

        // Trigger search
        fireEvent.change(screen.getByLabelText(/Patient ID/i), {
            target: { value: 'BAD_ID' },
        });
        fireEvent.click(screen.getByRole('button', { name: /Search/i }));

        // "Loading..." while pending
        expect(screen.getByText(/Loading/i)).toBeInTheDocument();

        // Wait for error
        await waitFor(() => {
            expect(screen.queryByText(/Loading/i)).toBeNull();
            expect(screen.getByText('Not found')).toBeInTheDocument();
        });
    });

    it('loads and displays the first image if fetchImages is successful', async () => {
        // Mock success from axios
        axios.get.mockResolvedValueOnce({
            data: { images: ['url1.dcm', 'url2.dcm'] },
        });
        // Mock Cornerstone loadImage
        cornerstone.loadImage.mockResolvedValueOnce({ /* fake image object */ });

        render(
            <Provider store={store}>
                <DicomViewer />
            </Provider>
        );

        // Perform search
        fireEvent.change(screen.getByLabelText(/Patient ID/i), {
            target: { value: 'PATIENT_123' },
        });
        fireEvent.click(screen.getByRole('button', { name: /Search/i }));

        // Wait for the store to load images
        await waitFor(() => {
            // The "Loading..." disappears
            expect(screen.queryByText(/Loading/i)).toBeNull();
            // The Next/Prev controls appear (since images array is not empty)
            expect(screen.getByText(/Showing image 1 of 2/i)).toBeInTheDocument();
        });

        // Check that Cornerstone was told to enable and load the first image
        expect(cornerstone.enable).toHaveBeenCalled();
        expect(cornerstone.loadImage).toHaveBeenCalledWith('wadouri:url1.dcm');
        // and eventually displayImage
        expect(cornerstone.displayImage).toHaveBeenCalled();
    });

    it('handles a DICOM parse error if the dataset is not in cache and manual fetch fails', async () => {
        // 1) fetchImages success for the array of images
        axios.get.mockResolvedValueOnce({
            data: { images: ['url1.dcm'] },
        });

        // 2) Cornerstone loadImage -> resolves
        cornerstone.loadImage.mockResolvedValueOnce({ /* fake image object */ });

        // 3) The dataSetCacheManager.get(...) returns undefined => triggers fallback manual fetch
        cornerstoneWADOImageLoader.wadouri.dataSetCacheManager.get.mockReturnValueOnce(undefined);

        // 4) The fallback manual fetch also fails parse
        axios.get.mockResolvedValueOnce({
            data: 'some bad data', // not actually a valid DICOM
        });
        jest
            .spyOn(global.console, 'error')
            .mockImplementation(() => { }); // silence console errors

        render(
            <Provider store={store}>
                <DicomViewer />
            </Provider>
        );

        // 5) search
        fireEvent.change(screen.getByLabelText(/Patient ID/i), {
            target: { value: 'PATIENT_123' },
        });
        fireEvent.click(screen.getByRole('button', { name: /Search/i }));

        // Wait for load
        await waitFor(() => {
            // The "Loading..." disappears
            expect(screen.queryByText(/Loading/i)).toBeNull();
            // We see "Showing image 1 of 1"
            expect(screen.getByText(/Showing image 1 of 1/i)).toBeInTheDocument();
        });

        // The attempt to parse the data will fail, so setMetadata(null) is eventually dispatched
        // There's no direct UI for that, but we can confirm no metadata is displayed
        expect(screen.queryByText(/DICOM Metadata/i)).toBeNull();

        // Also confirm a console error was printed
        expect(console.error).toHaveBeenCalled();
    });

    it('allows toggling metadata groups when metadata is available', async () => {
        // Provide some fake metadata
        const fakeMetadata = {
            Patient: {
                PatientID: '123',
                PatientName: 'John Doe',
            },
            Study: {
                StudyInstanceUID: '1.2.3.4.5',
            },
        };

        // Force the store to have some images, currentIndex=0, and metadata
        store.dispatch({
            type: 'viewer/fetchImages/fulfilled',
            payload: ['url1.dcm'],
        });
        store.dispatch({
            type: 'viewer/setMetadata',
            payload: fakeMetadata,
        });

        render(
            <Provider store={store}>
                <DicomViewer />
            </Provider>
        );

        // We should see the "DICOM Metadata" heading
        expect(screen.getByText(/DICOM Metadata/i)).toBeInTheDocument();

        // "Patient" and "Study" checkboxes
        const patientCheckbox = screen.getByLabelText(/Patient/i);
        const studyCheckbox = screen.getByLabelText(/Study/i);

        // By default, we show all groups if none are toggled
        expect(screen.getByText('PatientID')).toBeInTheDocument();
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('StudyInstanceUID')).toBeInTheDocument();

        // Toggle the "Patient" group
        fireEvent.click(patientCheckbox); // now selectedGroups['Patient'] = true
        // Wait a moment so the component re-renders
        // If "some are toggled," we only show those toggled. So "Study" is hidden.
        await waitFor(() => {
            expect(screen.getByText('PatientID')).toBeInTheDocument();
            expect(screen.queryByText('StudyInstanceUID')).toBeNull();
        });

        // Toggle the "Study" group as well
        fireEvent.click(studyCheckbox);
        await waitFor(() => {
            // Now both "Patient" and "Study" are explicitly toggled => both visible
            expect(screen.getByText('PatientID')).toBeInTheDocument();
            expect(screen.getByText('StudyInstanceUID')).toBeInTheDocument();
        });
    });
});
