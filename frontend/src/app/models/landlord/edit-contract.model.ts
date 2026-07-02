import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class EditContractModel {
  private apiUrl = `${environment.apiUrl}/contracts`;

  constructor(private http: HttpClient) {}

  // Fetch the contract details by ID
  getContract(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`);
  }

  // Submit the updated contract and new signature
  redraftContract(id: string, payload: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}/redraft`, payload);
  }
}