// // src/cornerstoneSetup.tsx
// import * as cornerstone from '@cornerstonejs/core';
// import * as csTools from '@cornerstonejs/tools';
// import dicomImageLoader from '@cornerstonejs/dicom-image-loader';

// export async function initializeCornerstoneJS() {
//   try {
//     // Initialize DICOM image loader
//     await dicomImageLoader.init({
//       maxWebWorkers: navigator.hardwareConcurrency || 1,
//     });
//     // Initialize csTools
//     await csTools.init();
//     // Initialize the core
//     await cornerstone.init();

//     console.log('CornerstoneJS + DICOM loader initialized.');
//   } catch (error) {
//     console.error('Error initializing CornerstoneJS:', error);
//   }
// }

export {}