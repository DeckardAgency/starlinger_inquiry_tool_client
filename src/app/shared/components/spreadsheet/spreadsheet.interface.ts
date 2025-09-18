export interface SpreadsheetRow {
  pieces?: string;
  item?: string;
  name?: string;
}

export type TabType = 'demo' | 'client';

export interface ExportOptions {
  filename?: string;
  sheetName?: string;
  includeTimestamp?: boolean;
}
