export interface ManualCartItem {
  id?: string;
  machineId: string;
  machineName: string;
  files?: any[]; // Or define a more specific type for files
  partData: {
    partName: string;
    partNumber?: string;
    shortDescription: string;
    additionalNotes?: string;
  };
}
