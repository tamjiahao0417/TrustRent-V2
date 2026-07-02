import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
@Injectable({
  providedIn: 'root'
})
export class DashboardModel {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // Fetch the dashboard statistics based on the user's role
  getDashboardStats(userId: string, role: string): Observable<any> {
    // We include a timestamp cache-buster to ensure the dashboard always shows the freshest data
    const timeStamp = new Date().getTime(); 
    return this.http.get(`${this.apiUrl}/dashboard/stats?user_id=${userId}&role=${role}&cb=${timeStamp}`);
  }
}