// src/app/services/http/machine.service.ts
import { HttpClient } from '@angular/common/http';
import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '@env/environment';
import { MachineResponse, Machine } from '@core/models/machine.model';

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
   * Get all machines (without client filter)
   * @param itemsPerPage Number of items to return per page
   * @returns Observable with MachineResponse
   */
  getMachines(itemsPerPage: number = 300): Observable<MachineResponse> {
    return this.http.get<any>(`${this.apiUrl}?itemsPerPage=${itemsPerPage}`).pipe(
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
   * Get machines for a specific client by ID
   * @param clientId The client ID
   * @param itemsPerPage Number of items to return per page
   * @returns Observable with MachineResponse
   */
  getMachinesByClientId(clientId: string, itemsPerPage: number = 300): Observable<MachineResponse> {
    return this.http.get<any>(
      `${this.clientApiUrl}/${clientId}/machines?itemsPerPage=${itemsPerPage}`
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
