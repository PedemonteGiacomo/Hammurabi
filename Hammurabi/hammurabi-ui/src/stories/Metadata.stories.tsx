import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import Sidebar, { SidebarProps } from '../components/Sidebar';
import DicomMetadataPanel from '../components/DicomMetadataPanel';

// campione completo di metadata
const sampleMetadata = {
  specificCharacterSet: 'ISO_IR 100',
  imageType: ['ORIGINAL', 'PRIMARY', 'AXIAL'],
  sopClassUID: '1.2.840.10008.5.1.4.1.1.2',
  sopInstanceUID: '1.2.3.4.5.6.7.8',
  studyDate: '2025-05-21',
  seriesDate: '2025-05-20',
  acquisitionDate: '2025-05-19',
  contentDate: '2025-05-22',
  studyTime: '12:00:00',
  seriesTime: '12:05:00',
  acquisitionTime: '12:08:00',
  contentTime: '12:10:00',
  accessionNumber: 'ACC12345',
  modality: 'MR',
  manufacturer: 'Acme Imaging',
  referringPhysicianName: 'Dr. Example',
  stationName: 'Station_X',
  studyDescription: 'Brain MRI',
  seriesDescription: 'T1 Axial High Res',
  manufacturerModelName: 'Model 123',
  referencedImageSequence: 'REFSEQ1',
  patientName: 'Rossi^Mario',
  patientId: 'P123456',
  patientBirthDate: '1980-02-15',
  patientSex: 'M',
  privateCreator: 'CREATOR',
  userData: { foo: 'bar' },
  normalizationCoefficient: '1.234',
  receivingGain: 10,
  meanImageNoise: '0.05',
  privateTagData: 'PRIVATE_DATA',
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
  studyInstanceUID: '1.2.3.4.5.6.7.9',
  seriesInstanceUID: '1.2.3.4.5.6.7.10',
  studyID: 'Study1',
  seriesNumber: '2',
  instanceNumber: '1',
  frameOfReferenceUID: '1.2.3.4.5.6.7.11',
  imagesInAcquisition: '120',
  positionReferenceIndicator: 'PRI',
  sliceLocation: '45.0',
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
  performedProcedureStepStartDate: '20250521',
  performedProcedureStepStartTime: '121500',
  performedProcedureStepID: 'PPS1',
};

const meta: Meta<SidebarProps> = {
  title: 'Components/Sidebar',
  component: Sidebar,
  decorators: [
    (Story) => (
      <div style={{ background: '#0d1117', padding: '1rem' }}>
        <Story />
      </div>
    ),
  ],
  argTypes: {
    metadata: {
      control: false,
    },
    width: {
      control: { type: 'text' },
      description: 'Width of the sidebar (string or number)',
    },
    height: {
      control: { type: 'text' },
      description: 'Height of the sidebar (string or number)',
    },
    collapsible: {
      control: { type: 'boolean' },
      description: 'Enable vertical scroll when content overflows',
    },
  },
  parameters: {
    layout: 'centered',
  },
};
export default meta;

type Story = StoryObj<SidebarProps>;

export const Empty: Story = {
  args: {
    metadata: null,
    width: '300px',
    height: 'auto',
    collapsible: false,
  },
};

export const WithMetadata: Story = {
  args: {
    metadata: sampleMetadata,
    width: '100%',
    height: '500px',
    collapsible: true,
  },
};
