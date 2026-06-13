import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MaintenanceDetailsModel {
  private apiUrl = 'http://localhost:8000/api/maintenance';

  constructor(private http: HttpClient) {}

  // Fetch the maintenance issue details
  getIssue(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`);
  }

  // Tenant action: Delete the maintenance issue
  deleteIssue(id: string, userId: string | null): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}?user_id=${userId}`);
  }

  // Landlord action: Update the status and add a message
  updateStatus(id: string, updateData: any): Observable<any> {
    // 🌟 Changed .put to .patch to perfectly match Laravel's api.php
    return this.http.patch(`${this.apiUrl}/${id}/status`, updateData);
  }
}