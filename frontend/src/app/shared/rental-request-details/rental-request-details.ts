import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-rental-request-details',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './rental-request-details.html',
  styleUrl: './rental-request-details.css' // Reuse appointment-details.css
})
export class RentalRequestDetails implements OnInit {
  request: any = null;
  userRole: string | null = '';

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private router: Router,
    private location: Location,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.userRole = localStorage.getItem('user_role');
    const id = this.route.snapshot.paramMap.get('id');
    
    this.http.get(`http://localhost:8000/api/rental-requests/${id}`).subscribe({
      next: (data: any) => {
        this.request = data;
        this.cdr.detectChanges();
      }
    });
  }

  deleteRequest() {
    if (confirm('Are you sure you want to delete this rental request? This cannot be undone.')) {
      this.http.delete(`http://localhost:8000/api/rental-requests/${this.request.id}?user_id=${localStorage.getItem('user_id')}`)
        .subscribe({
          next: () => {
            alert('Rental request deleted.');
            this.router.navigate(['/rental-requests']);
          },
          error: (err) => alert(err.error?.message || 'Failed to delete request.')
        });
    }
  }

  // --- LANDLORD ACTION ---
  // --- LANDLORD ACTION ---
  updateStatus(newStatus: string) {
    if (confirm(`Are you sure you want to ${newStatus.toLowerCase()} this rental request?`)) {
      this.http.patch(`http://localhost:8000/api/rental-requests/${this.request.id}/status`, { status: newStatus })
        .subscribe({
          next: () => {
            alert(`Request ${newStatus.toLowerCase()} successfully.`);
            this.request.status = newStatus; // Update the UI instantly
            this.cdr.detectChanges();
          },
          error: (err) => {
            // 🌟 NOW IT WILL SHOW THE REAL BACKEND MESSAGE!
            console.error("Full error:", err);
            alert(err.error?.message || 'Failed to update status. Check console for details.');
          }
        });
    }
  }

  // --- LANDLORD ACTION: NAVIGATE TO CREATE CONTRACT ---
  goToCreateContract() {
    // 🌟 Safety check: Prevent navigation if the property is already marked as rented
    if (this.request.property?.is_rented) {
        alert('A contract already exists for this property. You cannot create another one.');
        return;
    }
    // If safe, navigate to the creation form!
    this.router.navigate(['/contracts/create', this.request.id]);
  }

  goBack() { this.location.back(); }
}