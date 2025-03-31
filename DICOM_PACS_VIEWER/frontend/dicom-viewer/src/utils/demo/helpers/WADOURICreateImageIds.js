// File: utils/demo/helpers/WADOURICreateImageIds.js

// Sample SOP Instance UIDs for demonstration purposes.
const sopInstanceUIDs = [
    '1.3.6.1.4.1.14519.5.2.1.7009.2403.811199116755887922789178901449',
    '1.3.6.1.4.1.14519.5.2.1.7009.2403.187727384733858550691265022399',
    '1.3.6.1.4.1.14519.5.2.1.7009.2403.357394051723501392130797480739',
    '1.3.6.1.4.1.14519.5.2.1.7009.2403.238289677653540020337853698084',
    '1.3.6.1.4.1.14519.5.2.1.7009.2403.150443339571189271569805589542',
    // Add additional UIDs as needed...
  ];
  
  export function wadoURICreateImageIds() {
    // Sample Series and Study Instance UIDs
    const seriesUID =
      '1.3.6.1.4.1.14519.5.2.1.7009.2403.226151125820845824875394858561';
    const studyUID =
      '1.3.6.1.4.1.14519.5.2.1.7009.2403.334240657131972136850343327463';
  
    // Build the WADO-RS root URL.
    // Adjust the URL below to point to your DICOMweb server.
    const wadoURIRoot = `https://server.dcmjs.org/dcm4chee-arc/aets/DCM4CHEE/wado?requestType=WADO&studyUID=${studyUID}&seriesUID=${seriesUID}&contentType=application%2Fdicom`;
  
    // Map each SOP Instance UID to a WADO-URI image ID.
    const imageIds = sopInstanceUIDs.map((uid) => {
      return `wadouri:${wadoURIRoot}&objectUID=${uid}`;
    });
  
    return imageIds;
  }
  
  // Optional: Export sample CT and PT image IDs for alternative usage
  const ctImageIds = [
    'wadouri:https://ohif-assets-new.s3.us-east-1.amazonaws.com/ACRIN-Regular/CT+CT+IMAGES/CT000000.dcm',
    'wadouri:https://ohif-assets-new.s3.us-east-1.amazonaws.com/ACRIN-Regular/CT+CT+IMAGES/CT000001.dcm',
    // Add additional CT image IDs as needed...
  ];
  
  const ptImageIds = [
    'wadouri:https://ohif-assets-new.s3.us-east-1.amazonaws.com/ACRIN-Regular/PT+PET+AC/PT000000.dcm',
    'wadouri:https://ohif-assets-new.s3.us-east-1.amazonaws.com/ACRIN-Regular/PT+PET+AC/PT000001.dcm',
    // Add additional PT image IDs as needed...
  ];
  
  export { ctImageIds, ptImageIds };
  