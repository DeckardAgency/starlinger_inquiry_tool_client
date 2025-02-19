export interface MediaItem {
  '@id': string;
  '@type': string;
  id: string;
  filename: string;
  mimeType: string;
  filePath: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProductResponse {
  '@context': string;
  '@id': string;
  '@type': string;
  totalItems: number;
  member: Product[];
  view: any;
}

export interface Product {
  '@id': string;
  '@type': string;
  id: string;
  name: string;
  slug: string;
  partNo: string;
  shortDescription: string;
  technicalDescription: string;
  price: number;
  weight: string;
  featuredImage: MediaItem;
  createdAt: string;
  updatedAt: string;
}
