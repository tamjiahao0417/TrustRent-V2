import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AiMatchingModel {
  private apiUrl = 'http://localhost:8000/api/ai';

  constructor(private http: HttpClient) {}

  // For Tenants: Find matching properties based on preferences
  findPropertyMatchesForTenant(preferences: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/match`, preferences);
  }

  // For Landlords: Find matching tenants based on property details
  findTenantMatchesForLandlord(propertyDetails: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/match-tenants`, propertyDetails);
  }
}