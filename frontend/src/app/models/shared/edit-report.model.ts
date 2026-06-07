import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EditReportModel {
  private apiUrl = 'http://localhost:8000/api/reports';

  constructor(private http: HttpClient) {}

  // Fetch the existing report details
  getReport(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`);
  }

  // Submit the updated report (Using POST because FormData requires it for files, with _method=PUT inside)
  updateReport(id: string, formData: FormData): Observable<any> {
    return this.http.post(`${this.apiUrl}/${id}`, formData);
  }
}