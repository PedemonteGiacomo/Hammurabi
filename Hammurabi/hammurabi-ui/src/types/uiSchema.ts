export type DeviceVariant = 'mobile' | 'tablet' | 'desktop';

export interface SchemaComponent {
  /** Nome del componente React da istanziare (chiave in componentRegistry) */
  name: string;
  /** Props statiche da passare al componente */
  props?: Record<string, any>;
  /** Override di props per ciascuna variante di device */
  variants?: Record<DeviceVariant, Record<string, any>>;
  /** Se presente, lista di device su cui renderizzare */
  visibleOn?: DeviceVariant[];
  /** Figli annidati, se è un contenitore */
  children?: SchemaComponent[];
}

export interface PageSchema {
  /** Percorso React Router */
  path: string;
  /** Lista (in ordine) di componenti/controlli da montare nella pagina */
  components: SchemaComponent[];
}

export interface UISchema {
  pages: Record<string, PageSchema>;
}
