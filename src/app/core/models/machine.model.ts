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
  name?: string;
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
