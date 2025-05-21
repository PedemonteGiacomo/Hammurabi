// types/LayoutSchema.d.ts
interface ComponentConfig {
  component: string;
  variant?: string;
  props?: { [key: string]: any };
  style?: React.CSSProperties;
  className?: string;
  // Potenziali campi futuri: condition?, children?, ecc.
}

interface PageSchema {
  layout: {
    top?: ComponentConfig[];
    left?: ComponentConfig[];
    main?: ComponentConfig[];
    right?: ComponentConfig[];   // prevediamo anche una regione destra opzionale
    footer?: ComponentConfig[];
    [customRegion: string]: ComponentConfig[] | undefined; // per eventuali regioni aggiuntive future
  };
}
