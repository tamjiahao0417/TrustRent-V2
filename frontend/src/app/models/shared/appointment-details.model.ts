import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AppointmentDetailsModel {
  private apiUrl = 'http://localhost:8000/api/appointments';

  constructor(private http: HttpClient) {}

  // Fetch the appointment details
  getAppointment(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`);
  }

  // Tenant action: Delete the appointment
  deleteAppointment(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  // Landlord action: Approve or Reject the appointment
  updateStatus(id: string, newStatus: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}/status`, { status: newStatus });
  }
}