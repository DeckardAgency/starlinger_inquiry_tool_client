import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import { CartItem } from '@models/cart.model';
import {Order} from '@models/order.model';

export interface OrderRequest {
  status: string;
  shippingAddress: string;
  billingAddress: string;
  items: {
    product: string;
    quantity: number;
  }[];
  user: string;
}

export interface OrderItemResponse {
  '@id': string;
  '@type': string;
  product: {
    '@id': string;
    '@type': string;
    id: string;
    name: string;
    price: number;
  };
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface OrderResponse {
  '@context': string;
  '@id': string;
  '@type': string;
  id: string;
  orderNumber: string;
  status: string;
  totalAmount: number;
  shippingAddress: string;
  billingAddress: string;
  createdAt: string;
  updatedAt: string;
  lastSavedAt: string;
  items: OrderItemResponse[];
  user: string;
}

export interface OrdersCollection {
  '@context': string;
  '@id': string;
  '@type': string;
  'totalItems': number;
  'member': OrderResponse[];
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
export class OrderService {
  private apiUrl = `${environment.apiBaseUrl}${environment.apiPath}/orders`;

  constructor(private http: HttpClient) {}

  /**
   * Create a new order from cart items
   */
  createOrder(
    cartItems: CartItem[], shippingAddress: string, billingAddress: string, p0: string, id: any  ): Observable<OrderResponse> {
    // Transform cart items to the format expected by the API
    const items = cartItems.map(item => ({
      product: `/api/v1/products/${item.product.id}`,
      quantity: item.quantity
    }));

    const orderData: OrderRequest = {
      status: 'submitted',
      shippingAddress,
      billingAddress,
      items,
      user: '/api/v1/users/' + id
    };

    // Define headers explicitly for this request
    const headers = new HttpHeaders()
      .set('Content-Type', 'application/ld+json')
      .set('Accept', 'application/ld+json');

    // Pass the headers with the correct content type
    return this.http.post<OrderResponse>(this.apiUrl, orderData, { headers });
  }

  /**
   * Save order as draft
   */
  saveDraft(cartItems: CartItem[], shippingAddress: string, billingAddress: string, referenceNumber: string, userId: string): Observable<OrderResponse> {
    // Transform cart items to the format expected by the API
    const items = cartItems.map(item => ({
      product: `/api/v1/products/${item.product.id}`,
      quantity: item.quantity
    }));

    const orderData: OrderRequest = {
      status: 'draft',
      shippingAddress,
      billingAddress,
      items,
      user: '/api/v1/users/' + userId
    };

    // Define headers explicitly for this request
    const headers = new HttpHeaders()
      .set('Content-Type', 'application/ld+json')
      .set('Accept', 'application/ld+json');

    // Pass the headers with the correct content type
    return this.http.post<OrderResponse>(this.apiUrl, orderData, { headers });
  }

  /**
   * Get a single order by ID
   */
  getOrder(id: string): Observable<Order> {
    return this.http.get<Order>(`${this.apiUrl}/${id}`);
  }

  /**
   * Get orders by order number
   */
  getOrdersByOrderNumber(orderNumber: string): Observable<OrdersCollection> {
    // Define headers explicitly for this request
    const headers = new HttpHeaders()
      .set('Content-Type', 'application/ld+json')
      .set('Accept', 'application/ld+json');

    // Create the query parameters with orderNumber filter
    const params = new HttpParams().set('orderNumber', orderNumber);

    // Use the headers and params for GET requests
    return this.http.get<OrdersCollection>(this.apiUrl, { headers, params });
  }

  /**
   * Get all orders by user email
   */
  getOrdersByUserEmail(email: string): Observable<OrdersCollection> {
    // Define headers explicitly for this request
    const headers = new HttpHeaders()
      .set('Content-Type', 'application/ld+json')
      .set('Accept', 'application/ld+json');

    // Create the query parameters with the user.email filter
    const params = new HttpParams()
      .set('user.email', email)
      .set('isDraft', 'false');

    // Use the headers and params for GET requests
    return this.http.get<OrdersCollection>(this.apiUrl, { headers, params });
  }

  /**
   * Get draft orders by user email
   */
  getDraftOrdersByUserEmail(email: string): Observable<OrdersCollection> {
    // Define headers explicitly for this request
    const headers = new HttpHeaders()
      .set('Content-Type', 'application/ld+json')
      .set('Accept', 'application/ld+json');

    // Create the query parameters with user.email and status=draft filters
    const params = new HttpParams()
      .set('user.email', email)
      .set('status', 'draft');

    // Use the headers and params for GET requests
    return this.http.get<OrdersCollection>(this.apiUrl, { headers, params });
  }

  /**
   * Export order to PDF
   */
  exportOrderPdf(orderId: string): Observable<Blob> {
    return this.http.get(
      `${this.apiUrl}/${orderId}/export/pdf`,
      {
        headers: new HttpHeaders({
          'Accept': 'application/pdf'
        }),
        responseType: 'blob'
      }
    );
  }
}
