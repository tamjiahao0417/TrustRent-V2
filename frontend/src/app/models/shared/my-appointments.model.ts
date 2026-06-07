import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MyAppointmentsModel {
  private apiUrl = 'http://localhost:8000/api/appointments';

  constructor(private http: HttpClient) {}

  // Fetch the list of appointments for the current user
  getAppointments(userId: string, role: string): Observable<any> {
    return this.http.get(`${this.apiUrl}?user_id=${userId}&role=${role}`);
  }
}