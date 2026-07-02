import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SidebarModel {
  constructor(private http: HttpClient) {}

  // Handle the backend logout request
  logout(): Observable<any> {
    return this.http.post(`${environment.apiUrl}/logout`, {}, { withCredentials: true });
  }
}