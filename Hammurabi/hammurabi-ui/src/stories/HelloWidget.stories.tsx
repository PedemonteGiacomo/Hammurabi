// src/components/HelloWidget.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import HelloWidget from '../components/HelloWidget';

const meta: Meta<typeof HelloWidget> = {
  title: 'Components/HelloWidget',
  component: HelloWidget,
};
export default meta;

type Story = StoryObj<typeof HelloWidget>;

export const Default: Story = {
  // no args: uses on-disk schema
};

export const CustomColors: Story = {
  args: {
    __override__: {
      background: '#000',
      text: '#0f0',
      padding: '2rem',
      borderRadius: 12,
    },
  },
};