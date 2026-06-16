import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

// Import your newly created Model
import { ApplyPropertyModel } from '../../models/tenant/apply-property.model';

@Component({
  selector: 'app-apply-property',
  standalone: true,
  imports: [CommonModule, FormsModule],
  // Pointing to the new views folder
  templateUrl: '../../views/tenant/apply-property.html',
  styleUrl: '../../views/tenant/apply-property.css' 
})
export class ApplyPropertyController implements OnInit {
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
    private router: Router,
    private location: Location,
    private cdr: ChangeDetectorRef,
    private applyModel: ApplyPropertyModel // INJECTING THE MODEL HERE
  ) {}

  ngOnInit() {
    // Set the minimum date to today (YYYY-MM-DD format)
    const today = new Date();
    this.minDate = today.toISOString().split('T')[0];

    const propertyId = this.route.snapshot.paramMap.get('id');
    console.log("1. Angular grabbed ID from URL:", propertyId); // 🌟 DEBUG 1
    
    if (propertyId) {
      // Use the Model to fetch property details
      this.applyModel.getProperty(propertyId).subscribe({
        next: (data: any) => {
          console.log("2. Backend returned this data:", data); // 🌟 DEBUG 2
          this.property = data;
          this.cdr.detectChanges();
        },
        error: (err: any) => {
          // 🌟 DEBUG 3: This forces the silent error to print to your console!
          console.error("3. API Call Failed silently! Details:", err); 
          this.errorMessage = 'Failed to load property.';
          this.cdr.detectChanges();
        }
      });
    }
  }

  goBack() {
    this.location.back();
  }

  onSubmit(event: Event) {
    event.preventDefault();
    this.errorMessage = '';

    const requestData = {
      property_id: this.property?.id,
      landlord_id: this.property?.landlord_id,
      tenant_id: localStorage.getItem('user_id'), 
      start_date: this.startDate,
      end_date: this.endDate,
      move_in_date: this.moveInDate,
      notes: this.notes
    };

    // Use the Model to submit the request
    this.applyModel.submitRentalRequest(requestData).subscribe({
      next: (response: any) => {
        alert('Rental request sent successfully!');
        this.router.navigate(['/rental-requests']); 
      },
      error: (err: any) => {
        // Catch validation errors from Laravel
        this.errorMessage = err.error?.message || 'Error submitting request.';
        this.cdr.detectChanges();
      }
    });
  }
}