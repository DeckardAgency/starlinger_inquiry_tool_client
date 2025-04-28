import { HttpClient } from '@angular/common/http';
import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import {ProductResponse} from '@core/models';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private readonly apiUrl: string;

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    // Always use the apiBaseUrl from environment
    this.apiUrl = `${environment.apiBaseUrl}${environment.apiPath}/products`;
  }

  getProducts(): Observable<ProductResponse> {
    return this.http.get<ProductResponse>(`${this.apiUrl}?itemsPerPage=300`);
  }

  getProduct(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`);
  }
}
