import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MaintenanceModel {
  private apiUrl = 'http://localhost:8000/api/maintenance';

  constructor(private http: HttpClient) {}

  // Fetch maintenance issues depending on the user's role
  getIssues(userId: string, role: string): Observable<any> {
    return this.http.get(`${this.apiUrl}?user_id=${userId}&role=${role}`);
  }
}