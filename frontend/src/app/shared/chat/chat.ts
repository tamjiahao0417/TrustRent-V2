import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { LoadingSpinnerComponent } from '../../loading-spinner.component'; // 🌟 Import Spinner

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule, LoadingSpinnerComponent],
  templateUrl: './chat.html',
  styleUrl: './chat.css'
})
export class Chat implements OnInit {
  userRole: string | null = '';
  userId: string | null = '';
  
  contacts: any[] = [];
  selectedContact: any = null;
  messages: any[] = [];
  newMessage: string = '';
  
  isLoadingContacts: boolean = true;
  isLoadingMessages: boolean = false;

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.userRole = localStorage.getItem('user_role');
    this.userId = localStorage.getItem('user_id');
    this.loadContacts();
  }

  // 1. Load the list of people you can chat with
  loadContacts() {
    this.http.get(`http://localhost:8000/api/chat/contacts?user_id=${this.userId}&role=${this.userRole}`)
      .subscribe({
        next: (data: any) => {
          this.contacts = data;
          this.isLoadingContacts = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Failed to load contacts', err);
          this.isLoadingContacts = false;
          this.cdr.detectChanges();
        }
      });
  }

  // 2. Click on a contact to open their chat
  selectContact(contact: any) {
    this.selectedContact = contact;
    this.loadMessages(contact.id);
  }

  // 3. Load the message history for the selected contact
  loadMessages(contactId: number) {
    this.isLoadingMessages = true;
    this.http.get(`http://localhost:8000/api/chat/messages?user_id=${this.userId}&contact_id=${contactId}`)
      .subscribe({
        next: (data: any) => {
          this.messages = data;
          this.isLoadingMessages = false;
          this.scrollToBottom();
          this.cdr.detectChanges();
        },
        error: (err) => {
           console.error('Failed to load messages', err);
           this.isLoadingMessages = false;
           this.cdr.detectChanges();
        }
      });
  }

  // 4. Send a message
  sendMessage() {
    if (!this.newMessage.trim() || !this.selectedContact) return;

    const msgData = {
      sender_id: this.userId,
      receiver_id: this.selectedContact.id,
      message: this.newMessage
    };

    // Instantly show the message on screen (Optimistic UI update)
    this.messages.push({ ...msgData, created_at: new Date(), is_mine: true });
    this.newMessage = '';
    this.scrollToBottom();

    // Send to Laravel Backend
    this.http.post('http://localhost:8000/api/chat/send', msgData)
      .subscribe({
        next: () => console.log('Message sent successfully'),
        error: (err) => console.error('Error sending message', err)
      });
  }

  // Helper to keep the chat scrolled to the newest message at the bottom
  scrollToBottom() {
     setTimeout(() => {
        const container = document.getElementById('chat-history');
        if (container) container.scrollTop = container.scrollHeight;
     }, 100);
  }
}