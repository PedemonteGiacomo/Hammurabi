export type SchemaNode = {
  type: string;
  props?: Record<string, any>;
  children?: SchemaNode[] | string;
};

/** Schema for SelectionPage **/
export const selectionPageSchema: SchemaNode = {
  type: 'Flex',
  props: { direction: 'column', minH: '100vh' },
  children: [
    { type: 'TopBar' },
    {
      type: 'Box',
      props: { flex: 1, p: 4 },
      children: [
        { type: 'InputsPanel' },
        {
          type: 'NestedDicomTable',
          props: { onSelectSeriesKey: 'selectSeries' }
        }
      ]
    }
  ]
};

/** Schema for ViewerPage **/
export const viewerPageSchema: SchemaNode = {
  type: 'Flex',
  props: { direction: 'column', minH: '100vh' },
  children: [
    { type: 'TopBar' },
    { type: 'InfoRow' },
    { type: 'ViewerToolbar' },
    {
      type: 'Flex',
      props: { flex: 1, gap: 4, p: 4 },
      children: [
        {
          type: 'NewViewer',
          props: {
            seriesKey: 'selectedSeries',
            onMetadataExtractedKey: 'setMetadata',
            brightnessModeKey: 'brightnessMode'
          }
        },
        {
          type: 'Sidebar',
          props: { metadataKey: 'metadata' }
        }
      ]
    }
  ]
};