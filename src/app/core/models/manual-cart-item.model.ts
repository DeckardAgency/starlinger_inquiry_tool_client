import { MediaItem } from '@models/media.model';
import { Subscription } from 'rxjs';

export interface UploadedFile {
  name: string;
  size: number;
  type: string;
  file: File;
  status: 'uploading' | 'success' | 'error';
  progress: number;
  previewUrl?: string;
  mediaItem?: MediaItem;
  uploadSubscription?: Subscription;
  errorMessage?: string;
}

export interface ManualCartItem {
  id: string;
  machineId: string;
  machineName: string;
  partData: {
    partName: string;
    partNumber: string;
    shortDescription: string;
    additionalNotes: string;
    mediaItems?: MediaItem[];
  };
  files: UploadedFile[];
}
