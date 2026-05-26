import { Component, OnInit, ChangeDetectorRef, NgZone } from '@angular/core'; 
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './user-management.html',
  styleUrl: './user-management.css'
})
export class UserManagementComponent implements OnInit {
  users: any[] = [];

  constructor(
    private http: HttpClient, 
    private cdr: ChangeDetectorRef,
    private zone: NgZone // 🌟 FIX 1: Inject NgZone for guaranteed screen updates
  ) {}

  ngOnInit() {
    this.fetchUsers();
  }

  private getHeaders() {
    const token = localStorage.getItem('token'); 
    return new HttpHeaders()
      .set('Authorization', `Bearer ${token}`)
      .set('Accept', 'application/json');
  }

  fetchUsers() {
    const bypassCache = new Date().getTime();
    
    this.http.get(`http://localhost:8000/api/admin/users?t=${bypassCache}`).subscribe({
      next: (data: any) => {
        this.zone.run(() => {
            this.users = data.map((user: any) => {
                // 🌟 FIX 2: Standardize the case so 'suspended' matches 'Suspended' in HTML!
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

    this.http.patch(`http://localhost:8000/api/admin/users/${user.id}/${action}`, {}, { headers: this.getHeaders() }).subscribe({
      next: () => {
        this.zone.run(() => {
            // 1. Update the item
            user.status = newStatus;
            
            // 🌟 FIX 3: Recreate the array reference so Angular's *ngFor notices the change instantly!
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