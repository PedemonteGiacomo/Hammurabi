// src/stories/NestedDicomTable.stories.tsx
import { Meta, StoryObj } from '@storybook/react';
import { MemoryRouter } from 'react-router-dom';
import NestedDicomTable, { PatientInfo } from '../components/NestedDicomTable';
import sampleData from '../data/dicomData_updated.json';

const meta: Meta<typeof NestedDicomTable> = {
  title: 'Components/NestedDicomTable',
  component: NestedDicomTable,
  decorators: [
    (Story) => (
      <MemoryRouter initialEntries={['/']}>
        <Story />
      </MemoryRouter>
    ),
  ],
  argTypes: {
    data: { control: false },
    showPatientCount: { control: 'boolean' },
    initiallyExpandedPatients: { control: 'object' },
    initiallyExpandedStudies: { control: 'object' },
    tableClassName: { control: 'text' },
    rowHoverColor: { control: 'color' },
    toggleIcons: { control: 'object' },
    noDataMessage: { control: 'text' },
  },
  parameters: { layout: 'fullscreen' },
};
export default meta;

type Story = StoryObj<typeof NestedDicomTable>;

export const Default: Story = {
  args: {
    data: sampleData as PatientInfo[],
    showPatientCount: false,
    rowHoverColor: '#222',
  },
};

export const WithCounters: Story = {
  name: 'With patient counter',
  args: {
    ...Default.args,
    showPatientCount: true,
  },
};

export const InitiallyExpanded: Story = {
  name: 'Initially expanded',
  args: {
    ...Default.args,
    initiallyExpandedPatients: [(sampleData as PatientInfo[])[0].patientID],
    initiallyExpandedStudies: [
      (sampleData as PatientInfo[])[0].studies[0].studyUID,
    ],
  },
};

export const CustomIconsAndStyle: Story = {
  name: 'Custom icons & style',
  args: {
    ...Default.args,
    rowHoverColor: '#003366',
    toggleIcons: { open: '▾', closed: '▸' },
    tableClassName: 'table table-striped',
  },
};
