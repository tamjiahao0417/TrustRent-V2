import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ReportIssueModel {
  private apiUrl = `${environment.apiUrl}/reports`;

  constructor(private http: HttpClient) {}

  // Submit the report using FormData to handle text fields and file attachments
  submitReport(formData: FormData): Observable<any> {
    return this.http.post(this.apiUrl, formData);
  }
}