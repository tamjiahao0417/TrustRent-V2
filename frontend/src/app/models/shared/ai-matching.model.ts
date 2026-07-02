import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
@Injectable({
  providedIn: 'root'
})
export class AiMatchingModel {
  private apiUrl =environment.apiUrl;

  constructor(private http: HttpClient) {}

  // 🌟 Centralized Headers
  private getHeaders() {
    const token = localStorage.getItem('token'); 
    return new HttpHeaders()
      .set('Authorization', `Bearer ${token}`)
      .set('Accept', 'application/json');
  }

  // 🌟 NEW: Fetch the landlord's properties for the dropdown
  getLandlordProperties(userId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/my-properties?user_id=${userId}`, { headers: this.getHeaders() });
  }

  // For Tenants
  findPropertyMatchesForTenant(preferences: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/ai/match`, preferences, { headers: this.getHeaders() });
  }

  // For Landlords
  findTenantMatchesForLandlord(propertyDetails: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/ai/match-tenants`, propertyDetails, { headers: this.getHeaders() });
  }
}