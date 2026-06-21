import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RentPaymentModel {
  private apiUrl = 'http://localhost:8000/api';

  constructor(private http: HttpClient) {}

  // 🌟 Centralized header management for Sanctum Auth
  private getHeaders() {
    const token = localStorage.getItem('token'); 
    return new HttpHeaders()
      .set('Authorization', `Bearer ${token}`)
      .set('Accept', 'application/json');
  }

  // Fetch the current billing details for the tenant
  getBilling(userId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/transactions/billing-details/${userId}`, { headers: this.getHeaders() });
  }

  // 🌟 FIX: Added the missing getHistory function!
  // Fetches the tenant's transaction history
  getHistory(userId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/transactions`, { headers: this.getHeaders() });
  }

  // Save the successful Web3 transaction to the backend
  savePayment(payload: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/transactions/payment`, payload, { headers: this.getHeaders() });
  }
}