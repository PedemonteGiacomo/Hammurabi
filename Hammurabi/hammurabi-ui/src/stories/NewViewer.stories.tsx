// src/components/NewViewer.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import NewViewer from '../components/newViewer';
import type { SeriesInfo } from '../components/NestedDicomTable';

const dummy50: SeriesInfo = {
  seriesUID: '1.2.840.loop.50',
  seriesDescription: 'Dummy 50-frame series',
  numberOfImages: 50,
  imageFilePaths: Array.from({ length: 50 }, (_, i) =>
    `/assets/esaote_magnifico/ForMIP/1_3_76_2_1_1_4_1_3_9044_778600979_${i + 1}.dcm`
  ),
};

const meta: Meta<typeof NewViewer> = {
  title: 'Components/NewViewer',
  component: NewViewer,
  decorators: [
    (Story) => (
      <div style={{ width: '100%', height: '400px', background: '#000' }}>
        <Story />
      </div>
    ),
  ],
  parameters: {
    layout: 'fullscreen',
  },
};
export default meta;

type Story = StoryObj<typeof NewViewer>;

export const NoSeries: Story = {
  args: { series: null },
};

export const Loading: Story = {
  args: {
    series: {
      seriesUID: '1.2.3',
      seriesDescription: 'Dummy Series',
      numberOfImages: 1,
      imageFilePaths: ['/assets/dummy.dcm'],
    },
  },
};

export const BrightContrastMode: Story = {
  args: {
    series: {
      seriesUID: '1.2.3',
      seriesDescription: 'Dummy Series',
      numberOfImages: 1,
      imageFilePaths: ['/assets/esaote_magnifico/ForMIP/1_3_76_2_1_1_4_1_3_9044_778600979_49.dcm'],
    },
    brightnessMode: true,
  },
};

export const CineLoop: Story = {
  args: {
    series: dummy50,
    measurementMode: false,
    annotationMode: false,
    panMode: false,
    brightnessMode: true,
  },
};
