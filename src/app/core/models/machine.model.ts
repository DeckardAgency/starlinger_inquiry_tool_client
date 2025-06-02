import { MediaItem } from '@models/media.model';

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
  featuredImage: MediaItem | null;
  imageGallery: any[];
  name?: string;
  documents: MediaItem[] | string[];
}



export interface MachineResponse {
  '@context': string;
  '@id': string;
  '@type': string;
  totalItems: number;
  member: Machine[];
  view: any;
}

export interface MachineType {
  id: string;
  name: string;
  checked: boolean;
}
