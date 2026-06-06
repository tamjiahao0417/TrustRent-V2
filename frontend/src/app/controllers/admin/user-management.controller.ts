import { Component, OnInit, ChangeDetectorRef, NgZone } from '@angular/core'; 
import { CommonModule } from '@angular/common';
import { UserManagementService } from '../../models/user-management.model'; // 🌟 Import the Model

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule],
  templateUrl: '../../views/admin/user-management.html',
  styleUrl: '../../views/admin/user-management.css'
})
export class UserManagementComponent implements OnInit {
  users: any[] = [];

  constructor(
    private userService: UserManagementService, // 🌟 Inject the Model
    private cdr: ChangeDetectorRef,
    private zone: NgZone 
  ) {}

  ngOnInit() {
    this.fetchUsers();
  }

  fetchUsers() {
    // 🌟 Controller asks the Model for data
    this.userService.getUsers().subscribe({
      next: (data: any) => {
        this.zone.run(() => {
            this.users = data.map((user: any) => {
                if (!user.status || user.status.toLowerCase() === 'active') {
                    user.status = 'Active';
                } else if (user.status.toLowerCase() === 'suspended') {
                    user.status = 'Suspended';
                }
                return user;
            });
            this.cdr.detectChanges(); 
        });
      },
      error: (err: any) => console.error("Error loading users:", err)
    });
  }

  toggleUserStatus(user: any) {
    const action = user.status === 'Suspended' ? 'activate' : 'suspend';
    const newStatus = action === 'suspend' ? 'Suspended' : 'Active';

    if (!confirm(`Are you sure you want to ${action} this user account?`)) return;

    // 🌟 Controller sends the update request to the Model
    this.userService.updateUserStatus(user.id, action).subscribe({
      next: () => {
        this.zone.run(() => {
            user.status = newStatus;
            this.users = [...this.users]; 
            this.cdr.detectChanges();
        });
      },
      error: (err: any) => {
        alert(`Failed to ${action} user. Check console for details.`);
        console.error(err);
      }
    });
  }
}