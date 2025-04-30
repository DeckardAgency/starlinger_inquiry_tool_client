// Basic user interface
export interface User {
  id: string;
  email: string;
  roles: string[];
  firstName: string;
  lastName: string;
  createdAt?: string;
  updatedAt?: string;
  orders?: any[];
  username?: string; // For compatibility with existing code
}

// API response format (JSON-LD)
export interface UserCollectionResponse {
  '@context': string;
  '@id': string;
  '@type': string;
  totalItems: number;
  member: UserMember[];
  view: {
    '@id': string;
    '@type': string;
  };
  search: {
    '@type': string;
    template: string;
    variableRepresentation: string;
    mapping: {
      '@type': string;
      variable: string;
      property: string;
      required: boolean;
    }[];
  };
}

// Single user format in the collection
export interface UserMember {
  '@id': string;
  '@type': string;
  id: string;
  email: string;
  roles: string[];
  firstName: string;
  lastName: string;
  createdAt: string;
  updatedAt: string;
  orders: any[];
}
