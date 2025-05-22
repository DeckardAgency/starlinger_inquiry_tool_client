export interface SpreadsheetRow {
  id: number;
  productName: string;
  shortDescription: string;
  additionalNotes: string;
}

export type TabType = 'demo' | 'client';

export interface ExportOptions {
  filename?: string;
  sheetName?: string;
  includeTimestamp?: boolean;
}
