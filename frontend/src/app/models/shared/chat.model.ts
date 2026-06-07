import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ChatModel {
  private apiUrl = 'http://localhost:8000/api/chat';

  constructor(private http: HttpClient) {}

  // Fetch the list of contacts the user has interacted with
  getContacts(userId: string, role: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/contacts?user_id=${userId}&role=${role}`);
  }

  // Fetch the message history between the current user and the selected contact
  getMessages(userId: string, contactId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/messages?user_id=${userId}&contact_id=${contactId}`);
  }

  // Send a new message
  sendMessage(msgData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/send`, msgData);
  }
}