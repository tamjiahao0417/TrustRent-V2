import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TransactionDetailsModel {
  private apiUrl = `${environment.apiUrl}/transactions`;

  constructor(private http: HttpClient) {}

  // Fetch the transaction details by ID
  getTransaction(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`);
  }
}