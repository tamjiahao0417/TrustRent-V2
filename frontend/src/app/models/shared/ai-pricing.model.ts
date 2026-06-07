import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AiPricingModel {
  private apiUrl = 'http://localhost:8000/api/ai';

  constructor(private http: HttpClient) {}

  // Fetch properties belonging to the landlord for auto-fill
  getLandlordProperties(userId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/properties/${userId}`);
  }

  // Submit the property data to get a price prediction
  getPrediction(formData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/predict`, formData);
  }
}