// src/components/Sidebar.stories.tsx
import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import Sidebar from '../components/Sidebar';

const meta: Meta<typeof Sidebar> = {
  title: 'Components/Sidebar',
  component: Sidebar,
  decorators: [
    (Story) => (
      <div
        style={{
          display: 'flex',
          width: '500px',
          height: 'fit-content',
          padding: '1rem',
          background: '#0d1117',
        }}
      >
        <Story />
      </div>
    ),
  ],
  parameters: {
    layout: 'padded',
  },
};
export default meta;

type Story = StoryObj<typeof Sidebar>;

// completely empty
export const Empty: Story = {
  args: {
    metadata: null,
  },
};

// everything populated
export const WithMetadata: Story = {
  args: {
    metadata: {
      // — patient & study & series basics —
      specificCharacterSet: 'ISO_IR 100',
      imageType: ['ORIGINAL', 'PRIMARY'],
      sopClassUID: '1.2.840.10008.5.1.4.1.1.2',
      sopInstanceUID: '1.2.840.113619.2.55.3.604688433.783.1591782402.467',
      studyDate: '2025-05-21',
      seriesDate: '2025-05-20',
      acquisitionDate: '2025-05-19',
      contentDate: '2025-05-22',
      studyTime: '14:30:00',
      seriesTime: '14:45:00',
      acquisitionTime: '14:50:00',
      contentTime: '15:00:00',
      accessionNumber: 'ACC-000123',
      modality: 'MR',
      manufacturer: 'Acme Imaging',
      referringPhysicianName: 'Dr. Verdi',
      stationName: 'MRI_STATION_1',
      studyDescription: 'Brain MRI Study',
      seriesDescription: 'T1 Axial High Res',
      manufacturerModelName: 'AcmeModel X1',
      referencedImageSequence: 'SEQ12345',
      // — patient identity —
      patientName: 'Rossi^Mario',
      patientId: 'PAT-123456',
      patientBirthDate: '1970-01-01',
      patientSex: 'M',
      // — private tags —
      privateCreator: 'ACME_PRIV',
      userData: { foo: 'bar' },
      normalizationCoefficient: '1.234',
      receivingGain: 150,
      meanImageNoise: '0.05',
      privateTagData: 'PrivateTagValue',
      // — imaging parameters —
      bodyPartExamined: 'HEAD',
      scanningSequence: 'GR',
      sequenceVariant: 'SK',
      scanOptions: 'FAST',
      mRAcquisitionType: '2D',
      sequenceName: 'SE_T1',
      sliceThickness: '5',
      repetitionTime: '500',
      echoTime: '15',
      numberOfAverages: '1',
      imagingFrequency: '123.45',
      imagedNucleus: '1H',
      echoNumbers: '1',
      magneticFieldStrength: '3',
      spacingBetweenSlices: '6.5',
      echoTrainLength: '8',
      pixelBandwidth: '200',
      deviceSerialNumber: 'DEV123456',
      softwareVersions: 'v1.2.3',
      protocolName: 'StandardHeadMRI',
      receiveCoilName: 'HeadCoilA',
      acquisitionMatrix: '256\\256',
      inPlanePhaseEncodingDirection: 'ROW',
      flipAngle: '90',
      patientPosition: 'HFS',
      // — study/series identifiers —
      studyInstanceUID: '1.2.3.4.5.6.7.8.9.10',
      seriesInstanceUID: '1.2.3.4.5.6.7.8.9.11',
      studyID: 'STUDY123',
      seriesNumber: '2',
      instanceNumber: '1',
      frameOfReferenceUID: '1.2.3.4.5.6.7.8.9.12',
      imagesInAcquisition: '120',
      positionReferenceIndicator: 'REF1',
      sliceLocation: '50.0',
      // — geometry & pixmap —
      imagePositionPatient: [0.0, 0.0, -50.0],
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
      windowWidth: '200',
      lossyImageCompression: '00',
      // — performed procedure step —
      performedProcedureStepStartDate: '2025-05-21',
      performedProcedureStepStartTime: '14:25:00',
      performedProcedureStepID: 'STEP123',
    },
  },
};
