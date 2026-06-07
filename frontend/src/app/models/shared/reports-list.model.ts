import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ReportsListModel {
  private apiUrl = 'http://localhost:8000/api/reports';

  constructor(private http: HttpClient) {}

  // Fetch all reports
  getAllReports(): Observable<any> {
    return this.http.get(this.apiUrl);
  }
}