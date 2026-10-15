import { AngleMode, NumberFormatMode } from '../utils/mathEngine';

export interface HistoryItem {
  id: string;
  expression: string;
  result: string;
  numericValue: number;
  timestamp: number;
  isPinned?: boolean;
}

export type CalculatorMode = 'scientific' | 'standard' | 'arithmetic' | 'grapher' | 'converter';

export interface ConverterCategory {
  id: string;
  name: string;
  units: { id: string; name: string; ratioToBase: number; offset?: number }[];
}
