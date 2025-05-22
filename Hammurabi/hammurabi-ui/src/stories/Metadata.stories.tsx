/* src/stories/Metadata.stories.tsx */
import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import Sidebar, { SidebarProps } from '../components/Sidebar';
import DicomMetadataPanel, {
  DicomMetadataPanelProps,
} from '../components/DicomMetadataPanel';
import { sampleMetadata } from './_fixtures/sampleMetadata';

/* ---------- META (Sidebar) ---------- */
const meta: Meta<SidebarProps> = {
  title: 'Components/Sidebar',
  component: Sidebar,
  decorators: [
    (Story) => (
      <div
        style={{
          background: '#0d1117',
          padding: '1rem',
          minHeight: '100vh',
          overflowY: 'auto',
        }}
      >
        <Story />
      </div>
    ),
  ],
  argTypes: {
    metadata: { control: false },
    width: { control: 'text' },
    minWidth: { control: 'text' },
    maxWidth: { control: 'text' },
    height: { control: 'text' },
    minHeight: { control: 'text' },
    maxHeight: { control: 'text' },
    position: { control: { type: 'radio' }, options: ['left', 'right'] },
    collapsible: { control: 'boolean' },
    resizable: { control: 'boolean' },
    defaultCollapsed: { control: 'boolean' },
    bgColor: { control: 'color' },
    title: { control: 'text' },
    panelProps: { control: false },
  },
  parameters: { layout: 'fullscreen' },
};
export default meta;

/* ---------- SIDEBAR STORIES ---------- */
type SidebarStory = StoryObj<SidebarProps>;

export const Vuota: SidebarStory = {
  args: {
    metadata: null,
    width: '300px',
    height: 'auto',
    collapsible: false,
  },
};

export const Standard: SidebarStory = {
  args: {
    metadata: sampleMetadata,
    width: 500,
    height: '500px',
    collapsible: true,
    bgColor: '#111',
  },
};

/* ---------- DICOM METADATA PANEL STORIES ---------- */
interface PanelWrapperArgs {
  wrapperWidth?: string | number;
  wrapperHeight?: string | number;
  wrapperBg?: string;
}

interface ExtraPanelControls {
  showCategoryToggles?: boolean;
  collapsibleSections?: boolean;
  showTitle?: boolean;
}

type PanelStory = StoryObj<
  DicomMetadataPanelProps & ExtraPanelControls & PanelWrapperArgs
>;

const hideSidebarControls = {
  width: { table: { disable: true } },
  minWidth: { table: { disable: true } },
  maxWidth: { table: { disable: true } },
  height: { table: { disable: true } },
  minHeight: { table: { disable: true } },
  maxHeight: { table: { disable: true } },
  position: { table: { disable: true } },
  collapsible: { table: { disable: true } },
  resizable: { table: { disable: true } },
  defaultCollapsed: { table: { disable: true } },
  bgColor: { table: { disable: true } },
  title: { table: { disable: true } },
  panelProps: { table: { disable: true } },
};

export const PanelCompleto: PanelStory = {
  name: 'DicomMetadataPanel/Completo',
  render: ({ wrapperWidth, wrapperHeight, wrapperBg, ...panel }) => (
    <div
      style={{
        width: wrapperWidth,
        height: wrapperHeight,
        background: wrapperBg,
        padding: 8,
        overflowY: 'auto',
      }}
    >
        <DicomMetadataPanel {...panel} />
    </div>
  ),
  argTypes: {
    wrapperWidth: { control: 'text' },
    wrapperHeight: { control: 'text' },
    wrapperBg: { control: 'color' },
    showCategoryToggles: { control: 'boolean' },
    collapsibleSections: { control: 'boolean' },
    showTitle: { control: 'boolean' },
    ...hideSidebarControls,
  },
  args: {
    wrapperWidth: '100%',
    wrapperHeight: "400px",
    wrapperBg: '#1e1e1e',
    metadata: sampleMetadata,
    showCategoryToggles: true,
    collapsibleSections: true,
    showTitle: true,
  },
};
