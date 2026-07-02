import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class BookAppointmentModel {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // 🌟 ADDED: Grab the token and force JSON responses
  private getHeaders() {
    const token = localStorage.getItem('token'); 
    return new HttpHeaders()
      .set('Authorization', `Bearer ${token}`)
      .set('Accept', 'application/json');
  }

  // 🌟 FIX: Switched to the public view endpoint so the page loads successfully!
  getProperty(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/properties/view/${id}`);
  }

  // 🌟 FIX: Submit the appointment securely using the headers!
  bookAppointment(bookingData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/appointments`, bookingData, { headers: this.getHeaders() });
  }
}