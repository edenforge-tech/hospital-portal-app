/**
 * Type declarations for recharts
 * This resolves React 18 compatibility warnings
 */
declare module 'recharts' {
  import { ComponentType, ReactElement } from 'react';
  
  export type RechartsComponent<P = any> = (props: P) => ReactElement;
  
  export const ResponsiveContainer: RechartsComponent<{
    width?: string | number;
    height?: number;
    children?: React.ReactNode;
  }>;
  
  export const BarChart: RechartsComponent<{
    data?: any[];
    children?: React.ReactNode;
  }>;
  
  export const LineChart: RechartsComponent<{
    data?: any[];
    children?: React.ReactNode;
  }>;
  
  export const PieChart: RechartsComponent<{
    children?: React.ReactNode;
  }>;
  
  export const Pie: RechartsComponent<{
    data?: any[];
    dataKey?: string;
    nameKey?: string;
    cx?: string;
    cy?: string;
    innerRadius?: number;
    outerRadius?: number;
    fill?: string;
    label?: any;
    children?: React.ReactNode;
  }>;
  
  export const Bar: RechartsComponent<{
    dataKey?: string;
    fill?: string;
    name?: string;
  }>;
  
  export const Line: RechartsComponent<{
    type?: string;
    dataKey?: string;
    stroke?: string;
    name?: string;
    strokeWidth?: number;
  }>;
  
  export const Cell: RechartsComponent<{
    key?: string;
    fill?: string;
  }>;
  
  export const XAxis: RechartsComponent<{
    dataKey?: string;
    angle?: number;
    textAnchor?: string;
    height?: number;
  }>;
  
  export const YAxis: RechartsComponent<any>;
  
  export const CartesianGrid: RechartsComponent<{
    strokeDasharray?: string;
  }>;
  
  export const Tooltip: RechartsComponent<any>;
  
  export const Legend: RechartsComponent<any>;
  
  export interface PieLabelRenderProps {
    cx: number;
    cy: number;
    midAngle: number;
    innerRadius: number;
    outerRadius: number;
    percent: number;
    index: number;
    [key: string]: any;
  }
}
