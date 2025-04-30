import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import { CartItem } from '@models/cart.model';

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

export interface OrderResponse {
  "@context": string;
  "@id": string;
  "@type": string;
  id: string;
  orderNumber: string;
  status: string;
  totalAmount: number;
  shippingAddress: string;
  billingAddress: string;
  createdAt: string;
  updatedAt: string;
  items: string[]; // Contains order item URLs
  user: string;
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
      status: 'pending',
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
   * Get order details by ID
   */
  getOrderById(orderId: string): Observable<OrderResponse> {
    // Define headers explicitly for this request
    const headers = new HttpHeaders()
      .set('Content-Type', 'application/ld+json')
      .set('Accept', 'application/ld+json');

    // Use the headers for GET requests
    return this.http.get<OrderResponse>(`${this.apiUrl}/${orderId}`, { headers });
  }
}
