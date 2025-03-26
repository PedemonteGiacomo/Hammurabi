// DicomViewer.js
import React, { useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchImages, setPatientId, setCurrentIndex, setMetadata } from './ViewerSlice';

import axios from 'axios';
import cornerstone from 'cornerstone-core';
import cornerstoneWADOImageLoader from 'cornerstone-wado-image-loader';
import dicomParser from 'dicom-parser';
import { dicomTagDictionary } from './dicomTagDictionary';

import {
  Grid,
  Typography,
  TextField,
  Button,
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Checkbox,
  FormControlLabel,
  FormGroup,
} from '@mui/material';

// Configure cornerstone
cornerstoneWADOImageLoader.external.cornerstone = cornerstone;
cornerstoneWADOImageLoader.external.dicomParser = dicomParser;

/** Helper to extract metadata from dataset. */
const extractAllMetadata = (ds) => {
  const result = {};
  for (const group in dicomTagDictionary) {
    result[group] = {};
    dicomTagDictionary[group].forEach((item) => {
      result[group][item.name] = ds.string(item.tag) || 'N/A';
    });
  }
  return result;
};

const DicomViewer = () => {
  const dispatch = useDispatch();
  const containerRef = useRef(null);

  // Grab state from Redux
  const {
    patientId,
    images,
    currentIndex,
    metadata,
    status,
    error,
  } = useSelector((state) => state.viewer);

  // Attempt to load/display the current image each time currentIndex or images changes
  useEffect(() => {
    if (images.length > 0 && containerRef.current && currentIndex < images.length) {
      cornerstone.enable(containerRef.current);
      const imageId = `wadouri:${images[currentIndex]}`;

      cornerstone
        .loadImage(imageId)
        .then((image) => {
          cornerstone.displayImage(containerRef.current, image);
          // Check if dataset is in cache
          const ds = cornerstoneWADOImageLoader.wadouri.dataSetCacheManager.get(imageId);

          if (ds) {
            // Great, we have the dataset
            dispatch(setMetadata(extractAllMetadata(ds)));
          } else {
            // Otherwise fetch it manually
            axios
              .get(images[currentIndex], { responseType: 'arraybuffer' })
              .then((resp) => {
                try {
                  const byteArray = new Uint8Array(resp.data);
                  const dsFallback = dicomParser.parseDicom(byteArray);
                  dispatch(setMetadata(extractAllMetadata(dsFallback)));
                } catch (parseErr) {
                  console.error('Error parsing DICOM manually:', parseErr);
                  dispatch(setMetadata(null));
                }
              })
              .catch((fetchErr) => {
                console.error('Error fetching DICOM as ArrayBuffer:', fetchErr);
                dispatch(setMetadata(null));
              });
          }
        })
        .catch((err) => {
          console.error('Error loading image:', err);
          dispatch(setMetadata(null));
        });
    }
  }, [images, currentIndex, dispatch]);

  // Handler: dispatch an action to fetch images
  const handleSearch = () => {
    if (patientId.trim()) {
      dispatch(fetchImages(patientId));
    }
  };

  // UI events for stepping through images
  const handlePrev = () => {
    if (currentIndex > 0) {
      dispatch(setCurrentIndex(currentIndex - 1));
    }
  };
  const handleNext = () => {
    if (currentIndex < images.length - 1) {
      dispatch(setCurrentIndex(currentIndex + 1));
    }
  };

  // For toggling DICOM metadata categories (optional; same as your original code)
  const [selectedGroups, setSelectedGroups] = React.useState({});
  const toggleGroup = (groupName) => {
    setSelectedGroups((prev) => ({
      ...prev,
      [groupName]: !prev[groupName],
    }));
  };
  const groupsToDisplay = () => {
    const selected = Object.entries(selectedGroups).filter(([key, value]) => value);
    // If no group selected, show all
    if (selected.length === 0) return Object.keys(metadata || {});
    return selected.map(([groupName]) => groupName);
  };

  return (
    <Box p={2}>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={4} md={3}>
          <Typography variant="h6">Search by Patient ID</Typography>
          <TextField
            label="Patient ID"
            value={patientId}
            onChange={(e) => dispatch(setPatientId(e.target.value))}
            fullWidth
            variant="outlined"
            size="small"
            margin="normal"
          />
          <Button variant="contained" onClick={handleSearch} disabled={status === 'loading'}>
            Search
          </Button>
          {error && <Typography color="error" variant="body2">{error}</Typography>}
          {status === 'loading' && <Typography>Loading...</Typography>}
        </Grid>

        <Grid item xs={12} sm={8} md={9}>
          <div
            ref={containerRef}
            style={{ width: '512px', height: '512px', background: 'black' }}
          />
          <Box mt={2}>
            <Button
              variant="outlined"
              onClick={handlePrev}
              disabled={currentIndex <= 0}
              style={{ marginRight: '8px' }}
            >
              Prev
            </Button>
            <Button
              variant="outlined"
              onClick={handleNext}
              disabled={currentIndex >= images.length - 1}
            >
              Next
            </Button>
            <Typography variant="body2" sx={{ marginLeft: 2, display: 'inline-block' }}>
              Showing image {currentIndex + 1} of {images.length}
            </Typography>
          </Box>
        </Grid>
      </Grid>

      {/* Optional: DICOM metadata display */}
      {metadata && (
        <Box mt={4}>
          <Typography variant="h6">DICOM Metadata</Typography>
          {/* Checkboxes to toggle categories */}
          <FormGroup row>
            {Object.keys(metadata).map((group) => (
              <FormControlLabel
                key={group}
                control={
                  <Checkbox
                    checked={!!selectedGroups[group]}
                    onChange={() => toggleGroup(group)}
                  />
                }
                label={group}
              />
            ))}
          </FormGroup>

          {/* Table of selected metadata */}
          {groupsToDisplay().map((group) => (
            <Box key={group} mt={2}>
              <Typography variant="subtitle1">{group}</Typography>
              <TableContainer component={Paper}>
                <Table>
                  <TableBody>
                    {Object.entries(metadata[group]).map(([key, value]) => (
                      <TableRow key={key}>
                        <TableCell>{key}</TableCell>
                        <TableCell>{value}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
};

export default DicomViewer;
