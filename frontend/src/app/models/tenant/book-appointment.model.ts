import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BookAppointmentModel {
  private apiUrl = 'http://localhost:8000/api';

  constructor(private http: HttpClient) {}

  // Fetch the property details for the booking form
  getProperty(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/properties/${id}`);
  }

  // Submit the appointment booking payload to the backend
  bookAppointment(bookingData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/appointments`, bookingData);
  }
}