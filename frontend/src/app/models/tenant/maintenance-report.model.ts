import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MaintenanceReportModel {
  private apiUrl = 'http://localhost:8000/api';

  constructor(private http: HttpClient) {}

  // Fetch properties the tenant is currently renting
  getActiveProperties(userId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/maintenance-properties?user_id=${userId}`);
  }

  // Submit the new maintenance report (FormData handles the text and files)
  submitReport(formData: FormData): Observable<any> {
    return this.http.post(`${this.apiUrl}/maintenance`, formData);
  }
}