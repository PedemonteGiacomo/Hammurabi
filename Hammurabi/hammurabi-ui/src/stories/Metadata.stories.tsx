import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import Sidebar, { SidebarProps } from '../components/Sidebar';

/* ------------ stesso sample di prima, accorciato qui per brevità ---------- */
import { sampleMetadata } from './_fixtures/sampleMetadata';

const meta: Meta<SidebarProps> = {
  title: 'Components/Sidebar',
  component: Sidebar,
  decorators: [
    (Story) => (
      <div style={{ background: '#0d1117', padding: '1rem', height: '100vh' }}>
        <Story />
      </div>
    ),
  ],
  argTypes: {
    /* -------------------- DATA -------------------- */
    metadata: { control: false },
    /* ----------------- SIZE & LAYOUT -------------- */
    width: { control: 'text' },
    minWidth: { control: 'text' },
    maxWidth: { control: 'text' },
    height: { control: 'text' },
    minHeight: { control: 'text' },
    maxHeight: { control: 'text' },
    position: {
      control: { type: 'radio' },
      options: ['left', 'right'],
    },
    /* ----------------- BEHAVIOUR ------------------ */
    collapsible: { control: 'boolean' },
    resizable: { control: 'boolean' },
    defaultCollapsed: { control: 'boolean' },
    /* ----------------- STYLING -------------------- */
    bgColor: { control: 'color' },
    title: { control: 'text' },
    /* -------------- DICOM PANEL PROPS ------------- */
    panelProps: { control: false }, // gestisci con storie dedicate
  },
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<SidebarProps>;

export const Vuota: Story = {
  args: {
    metadata: null,
    width: '300px',
    height: 'auto',
    collapsible: false,
  },
};

export const Standard: Story = {
  args: {
    metadata: sampleMetadata,
    width: 500,
    height: '500px',
    collapsible: true,
    bgColor: '#111',
  },
};

// export const Personalizzata: Story = {
//   name: 'Personalizzata (tutto interattivo)',
//   args: {
//     metadata: sampleMetadata,
//     width: '30%',
//     minWidth: 260,
//     maxWidth: 600,
//     height: '100%',
//     position: 'right',
//     collapsible: true,
//     resizable: true,
//     bgColor: '#202632',
//     title: '🩻  Meta DICOM',
//     panelProps: {
//       showCategoryToggles: true,
//       collapsibleSections: true,
//       showTitle: false,
//     },
//   },
// };
