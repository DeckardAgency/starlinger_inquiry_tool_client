import { HttpClient } from '@angular/common/http';
import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '@env/environment';
import { ProductResponse } from '@core/models';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private readonly apiUrl: string;
  private readonly clientApiUrl: string;

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    // Base API URL for products
    this.apiUrl = `${environment.apiBaseUrl}${environment.apiPath}/products`;
    // Base API URL for client-specific products
    this.clientApiUrl = `${environment.apiBaseUrl}${environment.apiPath}/client`;
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
