// src/components/NestedDicomTable.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import NestedDicomTable, { SeriesInfo } from '../components/NestedDicomTable';

const meta: Meta<typeof NestedDicomTable> = {
  title: 'Components/NestedDicomTable',
  component: NestedDicomTable,
};
export default meta;

type Story = StoryObj<typeof NestedDicomTable>;

// Dummy handler che logga in console
const log = (label: string) => (s: SeriesInfo) => console.log(label, s);

export const Default: Story = {
  args: {
    onSelectSeries: log('onSelectSeries'),
    onSelectSeries2: log('onSelectSeries2'),
  },
};
