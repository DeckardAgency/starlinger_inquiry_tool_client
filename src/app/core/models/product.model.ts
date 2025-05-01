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
  technicalDescription?: string;
  unit?: string;
  regularPrice: number;
  clientPrice: number;
  discountPercentage?: number | null;
  effectivePrice?: number;
  isValid?: boolean;
  validFrom?: string | null;
  validUntil?: string | null;
  price?: number;
  weight?: string;
  featuredImage: MediaItem | null;
  imageGallery: MediaItem[];
  createdAt?: string;
  updatedAt?: string;
}

// Example of a product with the new structure:
/*
{
  "@id": "/api/v1/products/b7b52e52-a727-4be2-8a96-42561fdde85d",
  "@type": "Product",
  "id": "b7b52e52-a727-4be2-8a96-42561fdde85d",
  "name": "ahdt-01039-2",
  "slug": "ahdt-01039-2",
  "partNo": "AHDT-01039",
  "shortDescription": "",
  "unit": "",
  "regularPrice": 0,
  "clientPrice": 104,
  "discountPercentage": null,
  "effectivePrice": 104,
  "isValid": true,
  "validFrom": null,
  "validUntil": null,
  "featuredImage": {
    "@id": "/api/v1/media_items/059cf85d-eb13-4271-b051-ea1069739968",
    "@type": "MediaItem",
    "id": "059cf85d-eb13-4271-b051-ea1069739968",
    "filename": "ahdt-01039-02-6813a01c9650a.jpg",
    "mimeType": "image/jpeg",
    "filePath": "/uploads/ahdt-01039-02-6813a01c9650a.jpg"
  },
  "imageGallery": [{
    "@id": "/api/v1/media_items/702383d5-edfd-4051-b7ef-d9dd4b5856e5",
    "@type": "MediaItem",
    "id": "702383d5-edfd-4051-b7ef-d9dd4b5856e5",
    "filename": "ahdt-01039-01-6813a01c969ba.jpg",
    "mimeType": "image/jpeg",
    "filePath": "/uploads/ahdt-01039-01-6813a01c969ba.jpg"
  }]
}
*/
