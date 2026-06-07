import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ContractDetailsModel {
  private apiUrl = 'http://localhost:8000/api/contracts';

  constructor(private http: HttpClient) {}

  // Fetch the contract details
  getContract(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`);
  }

  // Tenant action: Sign the contract
  signContract(id: string, payload: any): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}/sign`, payload);
  }

  // Tenant action: Request an edit from the landlord
  requestEdit(id: string, reason: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}/request-edit`, { reason: reason });
  }

  // Landlord action: Save the blockchain transaction hash
  sealContract(id: string, txHash: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}/seal`, { blockchain_hash: txHash });
  }
}