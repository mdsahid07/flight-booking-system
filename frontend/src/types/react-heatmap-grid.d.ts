declare module 'react-heatmap-grid' {
    import { ReactNode } from 'react';
  
    interface HeatmapProps {
      xLabels: string[];
      yLabels: string[];
      data: number[][];
      cellStyle?: (background: string, value: number, min: number, max: number, data: any, x: number, y: number) => Record<string, any>;
      cellRender?: (value: number) => ReactNode;
    }
  
    const Heatmap: React.FC<HeatmapProps>;
    export default Heatmap;
  }