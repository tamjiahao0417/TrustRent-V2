import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// Define the structure of the data you are sending
export interface ContractPayload {
  user_id: string | null;
  rental_request_id: number;
  tenant_id: number;
  property_id: number;
  landlord_signature: string;
  [key: string]: any; // Allows the dynamic form data to be included
}

@Injectable({
  providedIn: 'root'
})
export class CreateContractModel {
  private apiUrl = 'http://localhost:8000/api';

  constructor(private http: HttpClient) {}

  // Fetch the rental request details
  getRentalRequest(requestId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/rental-requests/${requestId}`);
  }

  // Submit the contract payload to the backend
  createContract(payload: ContractPayload): Observable<any> {
    return this.http.post(`${this.apiUrl}/contracts`, payload);
  }
}