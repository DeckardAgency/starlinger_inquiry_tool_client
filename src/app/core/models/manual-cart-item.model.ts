import {MediaItem} from '@models/media.model';
import {UploadedFile} from '@features/manual-entry/template/manual-entry-template.component';

export interface ManualCartItem {
  id: string;
  machineId: string;
  machineName: string;
  partData: {
    partName: string;
    partNumber: string;
    shortDescription: string;
    additionalNotes: string;
    mediaItems?: MediaItem[]; // MediaItems are now inside partData
  };
  files: UploadedFile[];
}
