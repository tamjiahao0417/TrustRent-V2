import { Component, OnInit, ChangeDetectorRef } from '@angular/core'; 
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

// Import your newly created Model
import { BookAppointmentModel } from '../../models/tenant/book-appointment.model';

@Component({
  selector: 'app-book-appointment',
  standalone: true,
  imports: [CommonModule, FormsModule],
  // Pointing to the new views folder
  templateUrl: '../../views/tenant/book-appointment.html',
  styleUrl: '../../views/tenant/book-appointment.css'
})
export class BookAppointmentController implements OnInit {
  property: any = null;
  minDate: string = '';
  
  // Form Data
  appointmentDate: string = '';
  appointmentTime: string = '';
  appointmentType: string = '';
  errorMessage: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private location: Location,
    private cdr: ChangeDetectorRef,
    private appointmentModel: BookAppointmentModel // INJECTING THE MODEL HERE
  ) {}

  ngOnInit() {
    const today = new Date();
    this.minDate = today.toISOString().split('T')[0];

    const propertyId = this.route.snapshot.paramMap.get('id');
    
    if (propertyId) {
      // Use the Model to fetch the property
      this.appointmentModel.getProperty(propertyId).subscribe({
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
  }

  goBack() {
    this.location.back();
  }

  onSubmit(event: Event) {
    event.preventDefault();
    this.errorMessage = '';

    const bookingData = {
      property_id: this.property.id,
      landlord_id: this.property.landlord_id,
      tenant_id: localStorage.getItem('user_id'), 
      appointment_date: this.appointmentDate,
      appointment_time: this.appointmentTime,
      appointment_type: this.appointmentType
    };

    // Use the Model to submit the booking
    this.appointmentModel.bookAppointment(bookingData).subscribe({
      next: (response: any) => {
        alert('Appointment requested successfully! The landlord will review it soon.');
        this.router.navigate(['/appointments']); 
      },
      error: (err: any) => {
        this.errorMessage = err.error?.message || 'Error creating appointment.';
        this.cdr.detectChanges();
      }
    });
  }
}