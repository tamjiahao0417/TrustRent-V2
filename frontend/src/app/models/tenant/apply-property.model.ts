import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApplyPropertyModel {
  private apiUrl = 'http://localhost:8000/api';

  constructor(private http: HttpClient) {}

  // Fetch the property details to know what the user is applying for
  getProperty(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/properties/${id}`);
  }

  // Submit the rental request payload to the backend
  submitRentalRequest(requestData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/rental-requests`, requestData);
  }
}