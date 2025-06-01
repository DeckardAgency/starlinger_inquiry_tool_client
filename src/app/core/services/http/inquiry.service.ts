import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';

export interface InquiryProduct {
  partName: string;
  partNumber: string;
  shortDescription: string;
  additionalNotes: string;
}

export interface InquiryMachine {
  machine: string;
  notes: string;
  products: InquiryProduct[];
}

export interface InquiryRequest {
  status: string;
  notes: string;
  contactEmail: string;
  contactPhone: string;
  isDraft: boolean;
  user: string;
  machines: InquiryMachine[];
}

export interface InquiryProductResponse {
  '@id': string;
  '@type': string;
  id: string;
  partName: string;
  partNumber: string;
  shortDescription: string;
  additionalNotes: string;
}

export interface InquiryMachineResponse {
  '@id': string;
  '@type': string;
  id: string;
  machine: {
    '@id': string;
    '@type': string;
    id: string;
    articleDescription: string;
    articleNumber: string;
  };
  notes: string;
  products: InquiryProductResponse[];
}

export interface InquiryResponse {
  '@context': string;
  '@id': string;
  '@type': string;
  id: string;
  inquiryNumber: string;
  status: string;
  notes: string;
  contactEmail: string;
  contactPhone: string;
  isDraft: boolean;
  createdAt: string;
  updatedAt: string;
  machines: InquiryMachineResponse[];
  user: string;
}

export interface InquiriesCollection {
  '@context': string;
  '@id': string;
  '@type': string;
  'totalItems': number;
  'member': InquiryResponse[];
  'view': {
    '@id': string;
    '@type': string;
  };
  'search': {
    '@type': string;
    'template': string;
    'variableRepresentation': string;
    'mapping': Array<{
      '@type': string;
      'variable': string;
      'property': string;
      'required': boolean;
    }>;
  };
}

@Injectable({
  providedIn: 'root'
})
export class InquiryService {
  private apiUrl = `${environment.apiBaseUrl}${environment.apiPath}/inquiries`;

  constructor(private http: HttpClient) {}

  /**
   * Create a new inquiry
   */
  createInquiry(inquiryData: InquiryRequest): Observable<InquiryResponse> {
    // Define headers explicitly for this request
    const headers = new HttpHeaders()
      .set('Content-Type', 'application/ld+json')
      .set('Accept', 'application/ld+json');

    // Pass the headers with the correct content type
    return this.http.post<InquiryResponse>(this.apiUrl, inquiryData, { headers });
  }

  /**
   * Save inquiry as draft
   */
  saveDraft(inquiryData: InquiryRequest): Observable<InquiryResponse> {
    // Ensure the status is set to draft
    inquiryData.status = 'draft';
    inquiryData.isDraft = true;

    // Define headers explicitly for this request
    const headers = new HttpHeaders()
      .set('Content-Type', 'application/ld+json')
      .set('Accept', 'application/ld+json');

    // Pass the headers with the correct content type
    return this.http.post<InquiryResponse>(this.apiUrl, inquiryData, { headers });
  }

  /**
   * Get inquiry details by ID
   */
  getInquiryById(inquiryId: string): Observable<InquiryResponse> {
    // Define headers explicitly for this request
    const headers = new HttpHeaders()
      .set('Content-Type', 'application/ld+json')
      .set('Accept', 'application/ld+json');

    // Use the headers for GET requests
    return this.http.get<InquiryResponse>(`${this.apiUrl}/${inquiryId}`, { headers });
  }

  /**
   * Get all inquiries by user email
   */
  getInquiriesByUserEmail(email: string): Observable<InquiriesCollection> {
    // Define headers explicitly for this request
    const headers = new HttpHeaders()
      .set('Content-Type', 'application/ld+json')
      .set('Accept', 'application/ld+json');

    // Create the query parameters with the user.email filter
    const params = new HttpParams().set('user.email', email);

    // Use the headers and params for GET requests
    return this.http.get<InquiriesCollection>(this.apiUrl, { headers, params });
  }

  /**
   * Get draft inquiries by user email
   */
  getDraftInquiriesByUserEmail(email: string): Observable<InquiriesCollection> {
    // Define headers explicitly for this request
    const headers = new HttpHeaders()
      .set('Content-Type', 'application/ld+json')
      .set('Accept', 'application/ld+json');

    // Create the query parameters with user.email and status=draft filters
    const params = new HttpParams()
      .set('user.email', email)
      .set('status', 'draft');

    // Use the headers and params for GET requests
    return this.http.get<InquiriesCollection>(this.apiUrl, { headers, params });
  }
}
