import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RentPaymentModel {
  private apiUrl = 'http://localhost:8000/api';

  constructor(private http: HttpClient) {}

  // Fetch the current billing details and history for the tenant
  getBilling(userId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/billing/${userId}`);
  }

  // Save the successful Web3 transaction to the backend
  savePayment(payload: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/payments`, payload);
  }
}