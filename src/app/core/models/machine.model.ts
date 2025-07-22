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
  products: any[]
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


export interface MachineCollection {
  member: Machine[];
  totalItems: number;
  view?: PaginationView;
  search?: SearchConfig;
}

export interface PaginationView {
  '@id': string;
  '@type': string;
  first?: string;
  last?: string;
  previous?: string;
  next?: string;
}

export interface SearchConfig {
  '@type': string;
  template: string;
  variableRepresentation: string;
  mapping: SearchMapping[];
}

export interface SearchMapping {
  '@type': string;
  variable: string;
  property: string;
  required: boolean;
}
