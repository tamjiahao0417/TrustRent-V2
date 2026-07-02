import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ContractsModel {
  private apiUrl = `${environment.apiUrl}/contracts`;

  constructor(private http: HttpClient) {}

  // Fetch the list of contracts for the current user
  getContracts(userId: string, role: string): Observable<any> {
    return this.http.get(`${this.apiUrl}?user_id=${userId}&role=${role}`);
  }
}