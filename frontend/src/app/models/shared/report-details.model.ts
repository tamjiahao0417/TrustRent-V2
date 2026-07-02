import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ReportDetailsModel {
  private apiUrl = `${environment.apiUrl}/reports`;

  constructor(private http: HttpClient) {}

  // Fetch report details
  getReport(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`);
  }

  // Admin action: Update status and add a comment
  updateStatus(id: string, payload: any): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}/status`, payload);
  }

  // Reporter action: Delete the report
  deleteReport(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}