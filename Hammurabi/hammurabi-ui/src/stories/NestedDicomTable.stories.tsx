import { Meta, StoryObj } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import NestedDicomTable, {
  PatientInfo,
  SeriesInfo,
} from '../components/NestedDicomTable';
import sampleData from '../data/dicomData_updated.json';

const meta: Meta<typeof NestedDicomTable> = {
  title: 'Components/NestedDicomTable',
  component: NestedDicomTable,
  argTypes: {
    data: { control: false },
    onSelectSeries: { action: 'onSelectSeries' },
    onSelectSeries2: { action: 'onSelectSeries2' },
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
    onSelectSeries: action('select-1'),
    onSelectSeries2: action('select-2'),
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
  args: {
    ...Default.args,
    initiallyExpandedPatients: [(sampleData as PatientInfo[])[0].patientID],
    initiallyExpandedStudies: [
      (sampleData as PatientInfo[])[0].studies[0].studyUID,
    ],
  },
};

export const CustomIconsAndStyle: Story = {
  args: {
    ...Default.args,
    rowHoverColor: '#003366',
    toggleIcons: { open: '▾', closed: '▸' },
    tableClassName: 'table table-striped',
  },
};

// export const EmptyData: Story = {
//   args: {
//     data: [],
//     onSelectSeries: action('noop'),
//     onSelectSeries2: undefined,
//     noDataMessage: 'Nothing to display 🤷‍♂️',
//   },
// };
