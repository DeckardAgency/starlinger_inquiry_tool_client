// src/app/services/http/machine.service.ts
import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '@env/environment';
import { MachineResponse, Machine } from '@core/models/machine.model';

export interface MachineSearchParams {
  articleDescription?: string;
  itemsPerPage?: number;
  page?: number;
}

@Injectable({
  providedIn: 'root'
})
export class MachineService {
  private readonly apiUrl: string;
  private readonly clientApiUrl: string;

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    // Base API URL for machines
    this.apiUrl = `${environment.apiBaseUrl}${environment.apiPath}/machines`;
    // Base API URL for client-specific machines
    this.clientApiUrl = `${environment.apiBaseUrl}${environment.apiPath}/client`;
  }

  /**
   * Get all machines with optional search and pagination
   * @param searchParamsOrItemsPerPage Search parameters object OR number of items per page (for backward compatibility)
   * @returns Observable with MachineResponse
   */
  getMachines(searchParamsOrItemsPerPage: MachineSearchParams | number = {}): Observable<MachineResponse> {
    // Handle backward compatibility - if a number is passed, convert to searchParams
    let searchParams: MachineSearchParams;
    if (typeof searchParamsOrItemsPerPage === 'number') {
      searchParams = { itemsPerPage: searchParamsOrItemsPerPage };
    } else {
      searchParams = searchParamsOrItemsPerPage;
    }

    const params = this.buildHttpParams(searchParams);

    return this.http.get<any>(`${this.apiUrl}`, { params }).pipe(
      map(response => this.normalizeHydraResponse(response)),
      map(response => {
        // Add name property for UI compatibility
        response.member = response.member.map(machine => ({
          ...machine,
          name: machine.articleDescription
        }));
        return response;
      })
    );
  }

  /**
   * Search machines by article description
   * @param term Search term for article description
   * @param itemsPerPage Number of items to return per page
   * @returns Observable with MachineResponse
   */
  searchMachines(term: string, itemsPerPage: number = 300): Observable<MachineResponse> {
    return this.getMachines({
      articleDescription: term,
      itemsPerPage
    });
  }

  /**
   * Get machines for a specific client by ID with optional search
   * @param clientId The client ID
   * @param searchParamsOrItemsPerPage Search parameters object OR number of items per page (for backward compatibility)
   * @returns Observable with MachineResponse
   */
  getMachinesByClientId(clientId: string, searchParamsOrItemsPerPage: MachineSearchParams | number = {}): Observable<MachineResponse> {
    // Handle backward compatibility - if a number is passed, convert to searchParams
    let searchParams: MachineSearchParams;
    if (typeof searchParamsOrItemsPerPage === 'number') {
      searchParams = { itemsPerPage: searchParamsOrItemsPerPage };
    } else {
      searchParams = searchParamsOrItemsPerPage;
    }

    const params = this.buildHttpParams(searchParams);

    return this.http.get<any>(
      `${this.clientApiUrl}/${clientId}/machines`,
      { params }
    ).pipe(
      map(response => this.normalizeHydraResponse(response)),
      map(response => {
        // Add name property for UI compatibility
        response.member = response.member.map(machine => ({
          ...machine,
          name: machine.articleDescription
        }));
        return response;
      })
    );
  }

  /**
   * Search machines for a specific client
   * @param clientId The client ID
   * @param term Search term for article description
   * @param itemsPerPage Number of items to return per page
   * @returns Observable with MachineResponse
   */
  searchClientMachines(clientId: string, term: string, itemsPerPage: number = 300): Observable<MachineResponse> {
    return this.getMachinesByClientId(clientId, {
      articleDescription: term,
      itemsPerPage
    });
  }

  /**
   * Get a specific machine by ID
   * @param id Machine ID
   * @returns Observable with the machine data
   */
  getMachine(id: string): Observable<Machine> {
    return this.http.get<Machine>(`${this.apiUrl}/${id}`).pipe(
      map(machine => ({
        ...machine,
        name: machine.articleDescription
      }))
    );
  }

  /**
   * Get a specific machine for a client
   * @param clientId The client ID
   * @param machineId The machine ID
   * @returns Observable with the machine data
   */
  getClientMachine(clientId: string, machineId: string): Observable<Machine> {
    return this.http.get<Machine>(`${this.clientApiUrl}/${clientId}/machines/${machineId}`).pipe(
      map(machine => ({
        ...machine,
        name: machine.articleDescription
      }))
    );
  }

  /**
   * Build HttpParams from search parameters
   * @param searchParams Search parameters object
   * @returns HttpParams object
   */
  private buildHttpParams(searchParams: MachineSearchParams): HttpParams {
    let params = new HttpParams();

    // Add articleDescription search parameter
    if (searchParams.articleDescription?.trim()) {
      params = params.set('articleDescription', searchParams.articleDescription.trim());
    }

    // Add pagination parameters
    if (searchParams.itemsPerPage) {
      params = params.set('itemsPerPage', searchParams.itemsPerPage.toString());
    }

    if (searchParams.page) {
      params = params.set('page', searchParams.page.toString());
    }

    return params;
  }

  /**
   * Normalize Hydra responses to our standard MachineResponse format
   * @param response The Hydra API response
   * @returns Normalized MachineResponse
   */
  private normalizeHydraResponse(response: any): MachineResponse {
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
