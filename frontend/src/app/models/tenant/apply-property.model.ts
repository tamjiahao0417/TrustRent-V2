import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApplyPropertyModel {
  private apiUrl = 'http://localhost:8000/api';

  constructor(private http: HttpClient) {}

  // 🌟 ADDED: Grab the token and force JSON responses
  private getHeaders() {
    const token = localStorage.getItem('token'); 
    return new HttpHeaders()
      .set('Authorization', `Bearer ${token}`)
      .set('Accept', 'application/json');
  }

  // Fetch the property details (Using the public view endpoint)
  getProperty(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/properties/view/${id}`);
  }

  // 🌟 FIX: Submit the rental request securely using the headers!
  submitRentalRequest(requestData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/rental-requests`, requestData, { headers: this.getHeaders() });
  }
}