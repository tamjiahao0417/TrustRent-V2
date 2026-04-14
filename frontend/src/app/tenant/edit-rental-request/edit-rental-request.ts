import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-edit-rental-request',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './edit-rental-request.html',
  styleUrl: './edit-rental-request.css' 
})
export class EditRentalRequest implements OnInit {
  requestId: string | null = '';
  requestDetails: any = null;
  minDate: string = '';
  
  // Form Data
  startDate: string = '';
  endDate: string = '';
  moveInDate: string = '';
  notes: string = '';
  errorMessage: string = '';

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private router: Router,
    private location: Location,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.minDate = new Date().toISOString().split('T')[0];
    this.requestId = this.route.snapshot.paramMap.get('id');

    // Fetch existing request data
    this.http.get(`http://localhost:8000/api/rental-requests/${this.requestId}`).subscribe({
      next: (data: any) => {
        // Security redirect: If it's not Pending, they shouldn't be here!
        if (data.status !== 'Pending') {
          alert('This request can no longer be edited.');
          this.router.navigate(['/rental-requests']);
          return;
        }

        this.requestDetails = data;
        this.startDate = data.start_date;
        this.endDate = data.end_date;
        this.moveInDate = data.move_in_date;
        this.notes = data.notes || '';
        this.cdr.detectChanges();
      },
      error: () => {
        this.errorMessage = 'Failed to load request details.';
        this.cdr.detectChanges();
      }
    });
  }

  onSubmit(event: Event) {
    event.preventDefault();
    this.errorMessage = '';

    const updateData = {
      start_date: this.startDate,
      end_date: this.endDate,
      move_in_date: this.moveInDate,
      notes: this.notes
    };

    this.http.put(`http://localhost:8000/api/rental-requests/${this.requestId}`, updateData).subscribe({
      next: () => {
        alert('Rental request updated successfully!');
        this.router.navigate(['/rental-requests/details', this.requestId]);
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Error updating request.';
        this.cdr.detectChanges();
      }
    });
  }

  goBack() {
    this.location.back();
  }
}