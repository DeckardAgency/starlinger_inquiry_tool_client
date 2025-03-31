import { HttpClient } from '@angular/common/http';
import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformServer } from '@angular/common';
import { Observable } from 'rxjs';
import { ProductResponse } from '../interfaces/product.interface';
import { environment } from '../../../environment';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private apiUrl: string;
  private isServer: boolean;

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isServer = isPlatformServer(this.platformId);

    // During server-side rendering, we need absolute URLs
    const baseUrl = this.isServer ? environment.serverUrl : '';
    this.apiUrl = `${baseUrl}${environment.apiPath}/products?itemsPerPage=300`;
  }

  getProducts(): Observable<ProductResponse> {
    return this.http.get<ProductResponse>(this.apiUrl);
  }

  getProduct(id: string): Observable<any> {
    // Using the same pattern for the product detail endpoint
    const baseUrl = this.isServer ? environment.serverUrl : '';
    const productUrl = `${baseUrl}${environment.apiPath}/products/${id}`;
    return this.http.get(productUrl);
  }
}
