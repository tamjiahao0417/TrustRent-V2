import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-apply-property',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './apply-property.html',
  styleUrl: './apply-property.css' // We can reuse your existing form styles!
})
export class ApplyProperty implements OnInit {
  property: any = null;
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
    // Set the minimum date to today (YYYY-MM-DD format)
    const today = new Date();
    this.minDate = today.toISOString().split('T')[0];

    const propertyId = this.route.snapshot.paramMap.get('id');
    
    // Fetch property details so we know the landlord_id and title
    this.http.get(`http://localhost:8000/api/properties/${propertyId}`).subscribe({
      next: (data: any) => {
        this.property = data;
        this.cdr.detectChanges();
      },
      error: () => {
        this.errorMessage = 'Failed to load property.';
        this.cdr.detectChanges();
      }
    });
  }

  goBack() {
    this.location.back();
  }

  onSubmit(event: Event) {
    event.preventDefault();
    this.errorMessage = '';

    const requestData = {
      property_id: this.property.id,
      landlord_id: this.property.landlord_id,
      tenant_id: localStorage.getItem('user_id'), 
      start_date: this.startDate,
      end_date: this.endDate,
      move_in_date: this.moveInDate,
      notes: this.notes
    };

    this.http.post('http://localhost:8000/api/rental-requests', requestData).subscribe({
      next: (response: any) => {
        alert('Rental request sent successfully!');
        this.router.navigate(['/rental-requests']); // We will build this list next!
      },
      error: (err) => {
        // Catch validation errors from Laravel
        this.errorMessage = err.error?.message || 'Error submitting request.';
        this.cdr.detectChanges();
      }
    });
  }
}