import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { Observable, BehaviorSubject, map } from 'rxjs';
import { environment } from '@env/environment';
import { ProductResponse } from '@core/models';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private readonly apiUrl: string;
  private readonly clientApiUrl: string;

  // Add this for search selection functionality
  private selectedProductIdSubject = new BehaviorSubject<string | null>(null);
  public selectedProductId$ = this.selectedProductIdSubject.asObservable();

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    // Base API URL for products
    this.apiUrl = `${environment.apiBaseUrl}${environment.apiPath}/products`;
    // Base API URL for client-specific products
    this.clientApiUrl = `${environment.apiBaseUrl}${environment.apiPath}/client`;
  }

  // Methods for search selection
  setSelectedProductId(productId: string | null): void {
    this.selectedProductIdSubject.next(productId);
  }

  getSelectedProductId(): string | null {
    return this.selectedProductIdSubject.value;
  }

  clearSelectedProductId(): void {
    this.selectedProductIdSubject.next(null);
  }

  /**
   * Get all products (without client filter)
   * @param itemsPerPage Number of items to return per page
   * @returns Observable with ProductResponse
   */
  getProducts(itemsPerPage: number = 300): Observable<ProductResponse> {
    return this.http.get<any>(`${this.apiUrl}?itemsPerPage=${itemsPerPage}`).pipe(
      map(response => this.normalizeHydraResponse(response))
    );
  }

  /**
   * Get products for a specific client by ID
   * @param clientId The client ID
   * @param itemsPerPage Number of items to return per page
   * @returns Observable with ProductResponse
   */
  getProductsByClientId(clientId: string, itemsPerPage: number = 300): Observable<ProductResponse> {
    return this.http.get<any>(
      `${this.clientApiUrl}/${clientId}/products?itemsPerPage=${itemsPerPage}`
    ).pipe(
      map(response => this.normalizeHydraResponse(response))
    );
  }

  /**
   * Get products for a specific client by ID with filters
   * @param clientId The client ID
   * @param filters Object containing filter parameters
   * @param itemsPerPage Number of items to return per page
   * @returns Observable with ProductResponse
   */
  getProductsByClientIdWithFilters(
    clientId: string,
    filters: any = {},
    itemsPerPage: number = 300
  ): Observable<ProductResponse> {
    let params = new HttpParams();
    params = params.set('itemsPerPage', itemsPerPage.toString());

    // Handle machine filters with array notation
    if (filters['machines.articleDescription']) {
      const machineFilters = Array.isArray(filters['machines.articleDescription'])
        ? filters['machines.articleDescription']
        : [filters['machines.articleDescription']];

      machineFilters.forEach((machineDescription: string) => {
        params = params.append('machines.articleDescription[]', machineDescription);
      });
    }

    // Add other filters if needed
    Object.keys(filters).forEach(key => {
      if (key !== 'machines.articleDescription' && filters[key]) {
        if (Array.isArray(filters[key])) {
          filters[key].forEach((value: any) => {
            // Use array notation for other array filters too
            params = params.append(`${key}[]`, value.toString());
          });
        } else {
          params = params.set(key, filters[key].toString());
        }
      }
    });

    const url = `${this.clientApiUrl}/${clientId}/products`;
    console.log('API Request URL:', url);
    console.log('API Request Params:', params.toString());

    return this.http.get<any>(url, { params }).pipe(
      map(response => this.normalizeHydraResponse(response))
    );
  }

  /**
   * Get a specific product by ID
   * @param id Product ID
   * @returns Observable with the product data
   */
  getProduct(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`);
  }

  /**
   * Get a specific product for a client
   * @param clientId The client ID
   * @param productId The product ID
   * @returns Observable with the product data
   */
  getClientProduct(clientId: string, productId: string): Observable<any> {
    return this.http.get(`${this.clientApiUrl}/${clientId}/products/${productId}`);
  }

  /**
   * Normalize Hydra responses to our standard ProductResponse format
   * @param response The Hydra API response
   * @returns Normalized ProductResponse
   */
  private normalizeHydraResponse(response: any): ProductResponse {
    // Check if it's a Hydra response
    const isHydraResponse = response['hydra:totalItems'] !== undefined;

    if (isHydraResponse) {
      console.log('Detected Hydra response with totalItems:', response['hydra:totalItems']);

      return {
        '@context': response['@context'] || '',
        '@id': response['@id'] || '',
        '@type': response['@type'] || '',
        totalItems: response['hydra:totalItems'] || 0,
        member: response['hydra:member'] || [],
        view: response['hydra:view'] || null
      };
    }

    // Return original response if it's not a Hydra response
    return response;
  }
}
