import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SidebarModel {
  constructor(private http: HttpClient) {}

  // Handle the backend logout request
  logout(): Observable<any> {
    return this.http.post('http://localhost:8000/api/logout', {}, { withCredentials: true });
  }
}