import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AiPricingModel {
  // Base URL for the prediction
  private apiUrl = 'http://localhost:8000/api/ai';

  constructor(private http: HttpClient) {}

  // 🌟 Centralized Headers
  private getHeaders() {
    const token = localStorage.getItem('token'); 
    return new HttpHeaders()
      .set('Authorization', `Bearer ${token}`)
      .set('Accept', 'application/json');
  }

  // 🌟 ULTIMATE FIX: Use your existing Property route that we KNOW works!
  getLandlordProperties(userId: string): Observable<any> {
    return this.http.get(`http://localhost:8000/api/my-properties?user_id=${userId}`, { headers: this.getHeaders() });
  }

  // Submit the property data to get a price prediction
  getPrediction(formData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/price-estimate`, formData, { headers: this.getHeaders() });
  }
}