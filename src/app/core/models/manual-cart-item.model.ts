export interface ManualCartItem {
  id: string;
  partName: string;
  partNumber?: string;
  shortDescription: string;
  additionalNotes?: string;
  machineName: string;
  files?: File[];
}
