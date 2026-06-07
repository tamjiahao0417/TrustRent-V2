import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

// Import your Model from the shared folder
import { RentalRequestDetailsModel } from '../../models/shared/rental-request-details.model';

@Component({
  selector: 'app-rental-request-details',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: '../../views/shared/rental-request-details.html',
  styleUrl: '../../views/shared/rental-request-details.css'
})
export class RentalRequestDetailsController implements OnInit {
  request: any = null;
  userRole: string | null = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private location: Location,
    private cdr: ChangeDetectorRef,
    private requestModel: RentalRequestDetailsModel // INJECTING THE MODEL
  ) {}

  ngOnInit() {
    this.userRole = localStorage.getItem('user_role');
    const id = this.route.snapshot.paramMap.get('id');
    
    if (id) {
      this.requestModel.getRequest(id).subscribe({
        next: (data: any) => {
          this.request = data;
          this.cdr.detectChanges();
        }
      });
    }
  }

  deleteRequest() {
    if (confirm('Are you sure you want to delete this rental request? This cannot be undone.')) {
      const userId = localStorage.getItem('user_id');
      this.requestModel.deleteRequest(this.request.id, userId).subscribe({
        next: () => {
          alert('Rental request deleted.');
          this.router.navigate(['/rental-requests']);
        },
        error: (err: any) => alert(err.error?.message || 'Failed to delete request.')
      });
    }
  }

  updateStatus(newStatus: string) {
    if (confirm(`Are you sure you want to ${newStatus.toLowerCase()} this rental request?`)) {
      this.requestModel.updateStatus(this.request.id, newStatus).subscribe({
        next: () => {
          alert(`Request ${newStatus.toLowerCase()} successfully.`);
          this.request.status = newStatus;
          this.cdr.detectChanges();
        },
        error: (err: any) => {
          console.error("Full error:", err);
          alert(err.error?.message || 'Failed to update status.');
        }
      });
    }
  }

  goToCreateContract() {
    if (this.request.property?.is_rented) {
        alert('A contract already exists for this property. You cannot create another one.');
        return;
    }
    this.router.navigate(['/contracts/create', this.request.id]);
  }

  goBack() { this.location.back(); }
}