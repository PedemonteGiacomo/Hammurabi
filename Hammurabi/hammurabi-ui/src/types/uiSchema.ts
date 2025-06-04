export type DeviceVariant = 'mobile' | 'tablet' | 'desktop';

export interface SchemaComponent {
  /** Name of the React component to instantiate (key in componentRegistry) */
  name: string;
  /** Static props to pass to the component */
  props?: Record<string, any>;
  /** Prop overrides for each device variant */
  variants?: Record<DeviceVariant, Record<string, any>>;
  /** If present, list of devices on which to render */
  visibleOn?: DeviceVariant[];
  /** Nested children if this is a container */
  children?: SchemaComponent[];
}

export interface PageSchema {
  /** React Router path */
  path: string;
  /** Ordered list of components/controls to mount in the page */
  components: SchemaComponent[];
}

export interface UISchema {
  pages: Record<string, PageSchema>;
}
