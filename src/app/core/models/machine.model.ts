// src/app/core/models/machine.model.ts
export interface Machine {
  '@id': string;
  '@type': string;
  id: string;
  createdAt: string;
  updatedAt: string;
  ibStationNumber: number;
  ibSerialNumber: number;
  articleNumber: string;
  articleDescription: string;
  orderNumber: string;
  kmsIdentificationNumber: string;
  kmsIdNumber: string;
  mcNumber: string;
  fiStationNumber: number;
  fiSerialNumber: number;
  imageGallery: any[];
  // For UI compatibility with previous Product model
  name?: string; // We'll map articleDescription to this for compatibility
}

export interface MachineResponse {
  '@context': string;
  '@id': string;
  '@type': string;
  totalItems: number;
  member: Machine[];
  view: any;
}
