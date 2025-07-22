import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, forkJoin, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { Machine, MachineCollection } from '@core/models';
import { Product } from '@core/models';
import { Order, OrdersResponse } from '@models/order.model';
import {environment} from '@env/environment';

export interface SearchResultItem {
  id: string;
  title: string;
  type: 'machine' | 'product' | 'order';
  badge: string;
  route: string;
  description?: string;
  metadata?: any;
}

export interface SearchResults {
  machines: SearchResultItem[];
  products: SearchResultItem[];
  orders: SearchResultItem[];
  totalMachines: number;
  totalProducts: number;
  totalOrders: number;
}

@Injectable({
  providedIn: 'root'
})
export class SearchService {
  private apiUrl = `${environment.apiBaseUrl}${environment.apiPath}`;

  constructor(private http: HttpClient) {}

  /**
   * Search across all entities
   */
  searchAll(query: string): Observable<SearchResults> {
    if (!query || query.trim().length === 0) {
      return of({
        machines: [],
        products: [],
        orders: [],
        totalMachines: 0,
        totalProducts: 0,
        totalOrders: 0
      });
    }

    return forkJoin({
      machines: this.searchMachines(query),
      products: this.searchProducts(query),
      orders: this.searchOrders(query)
    }).pipe(
      map(results => ({
        machines: results.machines.items,
        products: results.products.items,
        orders: results.orders.items,
        totalMachines: results.machines.total,
        totalProducts: results.products.total,
        totalOrders: results.orders.total
      }))
    );
  }

  /**
   * Search machines by articleDescription
   */
  private searchMachines(query: string): Observable<{ items: SearchResultItem[], total: number }> {
    const params = new HttpParams()
      .set('articleDescription', query)
      .set('page', '1')
      .set('itemsPerPage', '10');

    return this.http.get<MachineCollection>(`${this.apiUrl}/machines`, { params }).pipe(
      map(response => ({
        items: response.member.map(machine => this.transformMachineToSearchResult(machine)),
        total: response.totalItems
      })),
      catchError(() => of({ items: [], total: 0 }))
    );
  }

  /**
   * Search products by name
   */
  private searchProducts(query: string): Observable<{ items: SearchResultItem[], total: number }> {
    const params = new HttpParams()
      .set('name', query)
      .set('page', '1')
      .set('itemsPerPage', '10');

    return this.http.get<any>(`${this.apiUrl}/products`, { params }).pipe(
      map(response => ({
        items: response.member ? response.member.map((product: Product) => this.transformProductToSearchResult(product)) : [],
        total: response.totalItems || 0
      })),
      catchError(() => of({ items: [], total: 0 }))
    );
  }

  /**
   * Search orders by orderNumber
   */
  private searchOrders(query: string): Observable<{ items: SearchResultItem[], total: number }> {
    const params = new HttpParams()
      .set('orderNumber', query)
      .set('page', '1')
      .set('itemsPerPage', '10');

    return this.http.get<OrdersResponse>(`${this.apiUrl}/orders`, { params }).pipe(
      map(response => ({
        items: response.member.map(order => this.transformOrderToSearchResult(order)),
        total: response.totalItems
      })),
      catchError(() => of({ items: [], total: 0 }))
    );
  }

  /**
   * Transform machine to search result
   */
  private transformMachineToSearchResult(machine: Machine): SearchResultItem {
    return {
      id: machine.id,
      title: machine.articleDescription || `Machine ${machine.articleNumber}`,
      type: 'machine',
      badge: 'Machine',
      route: `/machines/${machine.id}/edit`,
      description: `Article: ${machine.articleNumber} | S/N: ${machine.ibSerialNumber}`,
      metadata: {
        articleNumber: machine.articleNumber,
        serialNumber: machine.ibSerialNumber,
        mcNumber: machine.mcNumber
      }
    };
  }

  /**
   * Transform product to search result
   */
  private transformProductToSearchResult(product: Product): SearchResultItem {
    return {
      id: product.id,
      title: product.name,
      type: 'product',
      badge: 'Product',
      route: `/products/${product.id}/edit`,
      description: `Part No: ${product.partNo} | ${product.shortDescription}`,
      metadata: {
        partNo: product.partNo,
        price: product.price,
        unit: product.unit
      }
    };
  }

  /**
   * Transform order to search result
   */
  private transformOrderToSearchResult(order: Order): SearchResultItem {
    return {
      id: order.id,
      title: `Order ${order.orderNumber}`,
      type: 'order',
      badge: 'Order',
      route: `/orders/${order.id}/view`,
      description: `Status: ${order.status} | Total: ${order.totalAmount}`,
      metadata: {
        status: order.status,
        totalAmount: order.totalAmount,
        createdAt: order.createdAt
      }
    };
  }
}
