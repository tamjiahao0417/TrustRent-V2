import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RentalRequestsModel {
  private apiUrl = 'http://localhost:8000/api/rental-requests';

  constructor(private http: HttpClient) {}

  // Fetch the list of rental requests for the current user
  getRequests(userId: string, role: string): Observable<any> {
    return this.http.get(`${this.apiUrl}?user_id=${userId}&role=${role}`);
  }
}