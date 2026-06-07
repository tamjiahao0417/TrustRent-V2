import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RentalRequestDetailsModel {
  private apiUrl = 'http://localhost:8000/api/rental-requests';

  constructor(private http: HttpClient) {}

  // Fetch specific rental request details
  getRequest(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`);
  }

  // Tenant action: Delete the request
  deleteRequest(id: string, userId: string | null): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}?user_id=${userId}`);
  }

  // Landlord action: Approve or Reject
  updateStatus(id: string, status: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}/status`, { status });
  }
}