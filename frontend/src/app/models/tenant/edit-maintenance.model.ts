import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EditMaintenanceModel {
  private apiUrl = 'http://localhost:8000/api';

  constructor(private http: HttpClient) {}

  // Fetch properties the tenant is currently renting
  getMaintenanceProperties(userId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/maintenance-properties?user_id=${userId}`);
  }

  // Fetch the current maintenance issue details
  getMaintenanceIssue(issueId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/maintenance/${issueId}`);
  }

  // Submit the updated issue (Using POST because FormData requires it for files, with _method=PUT inside)
  updateMaintenanceIssue(issueId: string, formData: FormData): Observable<any> {
    return this.http.post(`${this.apiUrl}/maintenance/${issueId}`, formData);
  }
}