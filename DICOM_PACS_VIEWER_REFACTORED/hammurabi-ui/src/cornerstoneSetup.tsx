// src/cornerstoneSetup.ts
import * as cornerstone from '@cornerstonejs/core';
import * as csTools from '@cornerstonejs/tools';
import dicomImageLoader from '@cornerstonejs/dicom-image-loader';
import dicomParser from 'dicom-parser';

export async function initializeCornerstoneJS() {
  try {
    // (If needed, the new API allows you to pass external dependencies as an object.)
    // You can omit this step if the new API detects them automatically.
    // dicomImageLoader.external = { cornerstone, dicomParser };

    // Initialize the DICOM image loader. You can pass configuration options here.
    await dicomImageLoader.init({
      maxWebWorkers: navigator.hardwareConcurrency || 1,
      // (Additional configuration options can be provided if needed.)
    });

    // Initialize Cornerstone Tools (if you plan to use them)
    await csTools.init();

    // Initialize the core
    await cornerstone.init();

    console.log('CornerstoneJS and the DICOM image loader initialized successfully.');
  } catch (error) {
    console.error('Error initializing CornerstoneJS:', error);
  }
}
