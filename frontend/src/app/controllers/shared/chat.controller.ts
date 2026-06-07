import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

// Make sure this path points to your actual loading spinner
import { LoadingSpinnerComponent } from '../../loading-spinner.component'; 

// Import your newly created Model from the shared folder
import { ChatModel } from '../../models/shared/chat.model';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule, LoadingSpinnerComponent],
  // Pointing to the new views folder
  templateUrl: '../../views/shared/chat.html',
  styleUrl: '../../views/shared/chat.css'
})
export class ChatController implements OnInit {
  userRole: string | null = '';
  userId: string | null = '';
  
  contacts: any[] = [];
  selectedContact: any = null;
  messages: any[] = [];
  newMessage: string = '';
  
  isLoadingContacts: boolean = true;
  isLoadingMessages: boolean = false;

  constructor(
    private cdr: ChangeDetectorRef,  
    private route: ActivatedRoute,
    private chatModel: ChatModel // INJECTING THE MODEL HERE
  ) {}

  ngOnInit() {
    this.userRole = localStorage.getItem('user_role');
    this.userId = localStorage.getItem('user_id');
    this.loadContacts();
  }

  loadContacts() {
    if (!this.userId || !this.userRole) {
      this.isLoadingContacts = false;
      return;
    }

    // Use the Model to fetch contacts
    this.chatModel.getContacts(this.userId, this.userRole).subscribe({
      next: (data: any) => {
        this.contacts = data;
        this.isLoadingContacts = false;

        this.route.queryParams.subscribe(params => {
          if (params['contact_id']) {
              const targetContact = this.contacts.find(c => c.id == params['contact_id']);
              if (targetContact) {
                  this.selectContact(targetContact);
              }
          }
        });

        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('Failed to load contacts', err);
        this.isLoadingContacts = false;
        this.cdr.detectChanges();
      }
    });
  }

  selectContact(contact: any) {
    this.selectedContact = contact;
    this.loadMessages(contact.id);
  }

  loadMessages(contactId: number) {
    if (!this.userId) return;

    this.isLoadingMessages = true;
    
    // Use the Model to fetch messages
    this.chatModel.getMessages(this.userId, contactId).subscribe({
      next: (data: any) => {
        this.messages = data;
        this.isLoadingMessages = false;
        this.scrollToBottom();
        this.cdr.detectChanges();
      },
      error: (err: any) => {
         console.error('Failed to load messages', err);
         this.isLoadingMessages = false;
         this.cdr.detectChanges();
      }
    });
  }

  sendMessage() {
    if (!this.newMessage.trim() || !this.selectedContact || !this.userId) return;

    const msgData = {
      sender_id: this.userId,
      receiver_id: this.selectedContact.id,
      message: this.newMessage
    };

    // Instantly show the message on screen (Optimistic UI update)
    this.messages.push({ ...msgData, created_at: new Date(), is_mine: true });
    this.newMessage = '';
    this.scrollToBottom();

    // Use the Model to send to Laravel Backend
    this.chatModel.sendMessage(msgData).subscribe({
      next: () => console.log('Message sent successfully'),
      error: (err: any) => console.error('Error sending message', err)
    });
  }

  scrollToBottom() {
     setTimeout(() => {
        const container = document.getElementById('chat-history');
        if (container) container.scrollTop = container.scrollHeight;
     }, 100);
  }
}