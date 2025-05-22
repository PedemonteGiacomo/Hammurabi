// src/components/DicomMetadataPanel.stories.tsx
import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import DicomMetadataPanel from '../components/DicomMetadataPanel';

const meta: Meta<typeof DicomMetadataPanel> = {
  title: 'Components/DicomMetadataPanel',
  component: DicomMetadataPanel,
  decorators: [
    (Story) => (
      <div
        style={{
          background: '#1c1c1c',
          padding: '1rem',
          width: '600px',
          height: '500px',
          overflow: 'auto',
        }}
      >
        <Story />
      </div>
    ),
  ],
  parameters: {
    layout: 'centered',
  },
};
export default meta;

type Story = StoryObj<typeof DicomMetadataPanel>;

// Un oggetto con tutti i tag che il tuo componente sa renderizzare
const sampleMetadata = {
  /* — patient & study & series basics — */
  specificCharacterSet: 'ISO_IR 100',
  imageType: ['ORIGINAL', 'PRIMARY', 'AXIAL'],
  sopClassUID: '1.2.840.10008.5.1.4.1.1.2',
  sopInstanceUID: '1.2.3.4.5.6.7.8',
  studyDate: '2025-05-21',
  seriesDate: '2025-05-21',
  acquisitionDate: '2025-05-21',
  contentDate: '2025-05-21',
  studyTime: '120000',
  seriesTime: '120500',
  acquisitionTime: '120800',
  contentTime: '121000',
  accessionNumber: 'ACC12345',
  modality: 'MR',
  manufacturer: 'Acme Imaging',
  referringPhysicianName: 'Dr. Example',
  stationName: 'Station_X',
  studyDescription: 'Brain MRI',
  seriesDescription: 'T1 Axial High Res',
  manufacturerModelName: 'Model 123',
  referencedImageSequence: 'REFSEQ1',

  /* — patient identity — */
  patientName: 'Rossi^Mario',
  patientId: 'P123456',
  patientBirthDate: '1980-02-15',
  patientSex: 'M',

  /* — private tags — */
  privateCreator: 'CREATOR',
  userData: { foo: 'bar' },
  normalizationCoefficient: '1.234',
  receivingGain: 10,
  meanImageNoise: '0.05',
  privateTagData: 'PRIVATE_DATA',

  /* — imaging parameters — */
  bodyPartExamined: 'HEAD',
  scanningSequence: 'TSE',
  sequenceVariant: 'SK',
  scanOptions: 'NONE',
  mRAcquisitionType: '3D',
  sequenceName: 'SEQUENCE1',
  sliceThickness: '1.0',
  repetitionTime: '500',
  echoTime: '20',
  numberOfAverages: '2',
  imagingFrequency: '123.456',
  imagedNucleus: '1H',
  echoNumbers: '1',
  magneticFieldStrength: '3.0',
  spacingBetweenSlices: '1.2',
  echoTrainLength: '32',
  pixelBandwidth: '200',
  deviceSerialNumber: 'SERIAL123',
  softwareVersions: 'v1.2.3',
  protocolName: 'PROTO1',
  receiveCoilName: 'HeadCoil',
  acquisitionMatrix: '256x256',
  inPlanePhaseEncodingDirection: 'ROW',
  flipAngle: '90',
  patientPosition: 'HFS',

  /* — study/series identifiers — */
  studyInstanceUID: '1.2.3.4.5.6.7.9',
  seriesInstanceUID: '1.2.3.4.5.6.7.10',
  studyID: 'Study1',
  seriesNumber: '2',
  instanceNumber: '1',
  frameOfReferenceUID: '1.2.3.4.5.6.7.11',
  imagesInAcquisition: '120',
  positionReferenceIndicator: 'PRI',
  sliceLocation: '45.0',

  /* — geometry & pixmap — */
  imagePositionPatient: [0.0, 0.0, 0.0],
  imageOrientationPatient: [1.0, 0.0, 0.0, 0.0, 1.0, 0.0],
  samplesPerPixel: '1',
  photometricInterpretation: 'MONOCHROME2',
  rows: '512',
  columns: '512',
  pixelSpacing: [0.5, 0.5],
  bitsAllocated: '16',
  bitsStored: '12',
  highBit: '11',
  pixelRepresentation: '0',
  windowCenter: '100',
  windowWidth: '400',
  lossyImageCompression: '00',

  /* — performed procedure step — */
  performedProcedureStepStartDate: '20250521',
  performedProcedureStepStartTime: '121500',
  performedProcedureStepID: 'PPS1',
};

// export const Empty: Story = {
//   name: 'Empty (no metadata)',
//   args: {
//     metadata: null,
//   },
// };

export const FullMetadata: Story = {
  name: 'All Sections Expanded',
  args: {
    metadata: sampleMetadata,
  },
};
