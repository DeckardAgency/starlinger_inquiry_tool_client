import { UploadedFile} from '@models/manual-cart-item.model';
import { SpreadsheetRow } from '@shared/components/spreadsheet/spreadsheet.interface';

export interface Part {
  id: string;
  files: UploadedFile[];
  spreadsheetData?: SpreadsheetRow[];
}

