import { Component, OnInit, ChangeDetectorRef } from '@angular/core'; 
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http'; // 🌟 Add HttpHeaders here

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './user-management.html',
  styleUrl: './user-management.css'
})
export class UserManagementComponent implements OnInit {
  users: any[] = [];
  showModal: boolean = false;
  modalAction: 'suspend' | 'activate' = 'suspend';
  selectedUser: any = null;

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.fetchUsers();
  }

  // 🌟 Helper method to get headers
  // 🌟 Update this method in your user-management.ts file
  private getHeaders() {
    const token = localStorage.getItem('token'); 
    console.log("My Auth Token is:", token);
    
    // 🌟 Using .set() guarantees Angular attaches these to the network request
    return new HttpHeaders()
      .set('Authorization', `Bearer ${token}`)
      .set('Accept', 'application/json');
  }
  fetchUsers() {
    // 🌟 The Cache Buster: Forces the browser to ignore the saved HTML
    const bypassCache = new Date().getTime();
    
    this.http.get(`http://localhost:8000/api/admin/users?t=${bypassCache}`).subscribe({
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

  openConfirmModal(user: any, action: 'suspend' | 'activate') {
    this.selectedUser = user;
    this.modalAction = action;
    this.showModal = true; 
  }

  closeModal() {
    this.showModal = false;
    this.selectedUser = null; 
  }

  confirmAction() {
    if (!this.selectedUser) return;

    const endpoint = this.modalAction === 'suspend' ? 'suspend' : 'activate';
    const newStatus = this.modalAction === 'suspend' ? 'Suspended' : 'Active';

    // 🌟 Pass the headers into the PATCH request too!
    this.http.patch(`http://localhost:8000/api/admin/users/${this.selectedUser.id}/${endpoint}`, {}, { headers: this.getHeaders() }).subscribe({
      next: () => {
        alert(`User ${this.modalAction}ed successfully.`);
        this.selectedUser.status = newStatus;
        this.closeModal();
        this.cdr.detectChanges(); 
      },
      error: () => {
        alert(`Failed to ${this.modalAction} account.`);
        this.closeModal();
      }
    });
  }
}