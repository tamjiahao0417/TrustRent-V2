import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class EditAppointmentModel {
  private apiUrl = `${environment.apiUrl}/appointments`;

  constructor(private http: HttpClient) {}

  // Fetch the current appointment details
  getAppointment(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`);
  }

  // Submit the updated appointment data
  updateAppointment(id: string, updateData: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, updateData);
  }
}