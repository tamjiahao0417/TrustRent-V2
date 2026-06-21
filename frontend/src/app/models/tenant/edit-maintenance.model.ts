import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EditMaintenanceModel {
  private apiUrl = 'http://localhost:8000/api';

  constructor(private http: HttpClient) {}

  // 🌟 ADDED: Centralized header management for Sanctum Auth
  private getHeaders() {
    const token = localStorage.getItem('token'); 
    return new HttpHeaders()
      .set('Authorization', `Bearer ${token}`)
      .set('Accept', 'application/json');
  }

  // 🌟 FIX 1: Changed URL to match your api.php file (/active-properties)
  // 🌟 FIX 2: Added security headers
  getMaintenanceProperties(userId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/active-properties?user_id=${userId}`, { headers: this.getHeaders() });
  }

  // 🌟 FIX 3: Added security headers to fetch the issue details
  getMaintenanceIssue(issueId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/maintenance/${issueId}`, { headers: this.getHeaders() });
  }

  // 🌟 FIX 4: Added security headers for the form submission
  updateMaintenanceIssue(issueId: string, formData: FormData): Observable<any> {
    return this.http.post(`${this.apiUrl}/maintenance/${issueId}`, formData, { headers: this.getHeaders() });
  }
}