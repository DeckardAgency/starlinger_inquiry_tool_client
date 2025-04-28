// src/app/core/models/product.model.ts
import { MediaItem } from './media.model';

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
  featuredImage: MediaItem | null;
  imageGallery: MediaItem[];
  createdAt: string;
  updatedAt: string;
}
