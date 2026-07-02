import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MaintenanceReportModel {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // Fetch properties the tenant is currently renting
  getActiveProperties(userId: string): Observable<any> {
    // 🌟 Changed from /maintenance-properties to /active-properties
    return this.http.get(`${this.apiUrl}/active-properties?user_id=${userId}`);
  }

  // Submit the new maintenance report (FormData handles the text and files)
  submitReport(formData: FormData): Observable<any> {
    return this.http.post(`${this.apiUrl}/maintenance`, formData);
  }
}