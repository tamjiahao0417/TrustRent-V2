import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ContractDetailsModel {
  private apiUrl = 'http://localhost:8000/api/contracts';

  constructor(private http: HttpClient) {}

  // 🌟 ADDED: Centralized header management for Sanctum Auth
  private getHeaders() {
    const token = localStorage.getItem('token'); 
    return new HttpHeaders()
      .set('Authorization', `Bearer ${token}`)
      .set('Accept', 'application/json');
  }

  // Fetch the contract details
  getContract(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }

  // 🌟 FIX: Changed from .patch to .post and added Auth Headers
  signContract(id: string, payload: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/${id}/sign`, payload, { headers: this.getHeaders() });
  }

  // 🌟 FIX: Changed from .patch to .post and added Auth Headers
  requestEdit(id: string, reason: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/${id}/request-edit`, { reason: reason }, { headers: this.getHeaders() });
  }

  // 🌟 FIX: Changed from .patch to .post and added Auth Headers
  sealContract(id: string, txHash: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/${id}/seal`, { blockchain_hash: txHash }, { headers: this.getHeaders() });
  }
}