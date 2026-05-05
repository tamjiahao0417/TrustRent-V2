import { Component, OnInit, ChangeDetectorRef } from '@angular/core'; 
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http'; 

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './user-management.html',
  styleUrl: './user-management.css'
})
export class UserManagementComponent implements OnInit {
  users: any[] = [];
  
  // 🌟 Updated Modal Variables
  showModal: boolean = false;
  modalAction: 'suspend' | 'activate' = 'suspend';
  selectedUser: any = null;

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.fetchUsers();
  }

  fetchUsers() {
    this.http.get('http://127.0.0.1:8000/api/admin/users').subscribe({
      next: (data: any) => {
        this.users = data.map((user: any) => {
            if (!user.status) user.status = 'Active';
            return user;
        });
        this.cdr.detectChanges(); 
      },
      error: (err: any) => console.error("Error loading users:", err)
    });
  }

  // 🌟 Dynamic Modal Opener
  openConfirmModal(user: any, action: 'suspend' | 'activate') {
    this.selectedUser = user;
    this.modalAction = action;
    this.showModal = true; 
  }

  closeModal() {
    this.showModal = false;
    this.selectedUser = null; 
  }

  // 🌟 Dynamic Confirm Button (Handles BOTH Suspend and Activate)
  confirmAction() {
    if (!this.selectedUser) return;

    // Determine the correct endpoint and status based on the button clicked
    const endpoint = this.modalAction === 'suspend' ? 'suspend' : 'activate';
    const newStatus = this.modalAction === 'suspend' ? 'Suspended' : 'Active';

    this.http.patch(`http://127.0.0.1:8000/api/admin/users/${this.selectedUser.id}/${endpoint}`, {}).subscribe({
      next: () => {
        alert(`User ${this.modalAction}ed successfully.`);
        this.selectedUser.status = newStatus; // Update the UI
        this.closeModal();
        this.cdr.detectChanges(); // Force HTML redraw
      },
      error: () => {
        alert(`Failed to ${this.modalAction} account.`);
        this.closeModal();
      }
    });
  }
}