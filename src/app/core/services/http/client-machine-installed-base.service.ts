import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ClientMachineInstalledBase, ClientMachineInstalledBaseResponse } from '@core/models/client-machine-installed-base.model';
import { environment } from '@env/environment';

@Injectable({
  providedIn: 'root'
})
export class ClientMachineInstalledBaseService {
  private baseUrl = `${environment.apiBaseUrl}${environment.apiPath}/client_machine_installed_bases`;

  constructor(private http: HttpClient) {}

  /**
   * Get client machine installed bases by client code
   * @param clientCode The client code to filter by
   * @returns Observable with the client machine installed bases
   */
  getClientMachinesByClientCode(clientCode: string): Observable<ClientMachineInstalledBaseResponse> {
    const params = new HttpParams().set('client.code', clientCode);
    return this.http.get<ClientMachineInstalledBaseResponse>(this.baseUrl, { params });
  }

  /**
   * Get all client machine installed bases
   * @returns Observable with all client machine installed bases
   */
  getAllClientMachines(): Observable<ClientMachineInstalledBaseResponse> {
    return this.http.get<ClientMachineInstalledBaseResponse>(this.baseUrl);
  }

  /**
   * Get client machine installed base by ID
   * @param id The ID of the client machine installed base
   * @returns Observable with the client machine installed base
   */
  getClientMachineById(id: string): Observable<ClientMachineInstalledBase> {
    return this.http.get<ClientMachineInstalledBase>(`${this.baseUrl}/${id}`);
  }

  /**
   * Create a new client machine installed base
   * @param clientMachine The client machine data to create
   * @returns Observable with the created client machine installed base
   */
  createClientMachine(clientMachine: Partial<ClientMachineInstalledBase>): Observable<ClientMachineInstalledBase> {
    return this.http.post<ClientMachineInstalledBase>(this.baseUrl, clientMachine);
  }

  /**
   * Update a client machine installed base
   * @param id The ID of the client machine to update
   * @param clientMachine The updated client machine data
   * @returns Observable with the updated client machine installed base
   */
  updateClientMachine(id: string, clientMachine: Partial<ClientMachineInstalledBase>): Observable<ClientMachineInstalledBase> {
    return this.http.put<ClientMachineInstalledBase>(`${this.baseUrl}/${id}`, clientMachine);
  }

  /**
   * Delete a client machine installed base
   * @param id The ID of the client machine to delete
   * @returns Observable with the deletion result
   */
  deleteClientMachine(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
