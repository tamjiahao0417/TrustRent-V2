import { Component, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-book-appointment',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './book-appointment.html',
  styleUrl: './book-appointment.css'
})
export class BookAppointment implements OnInit {
  property: any = null;
  minDate: string = '';
  
  // Form Data
  appointmentDate: string = '';
  appointmentTime: string = '';
  appointmentType: string = '';
  errorMessage: string = '';

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private router: Router,
    private location: Location
  ) {}

  ngOnInit() {
    // Set minimum date to today so they can't book in the past
    const today = new Date();
    this.minDate = today.toISOString().split('T')[0];

    const propertyId = this.route.snapshot.paramMap.get('id');
    
    // Fetch property details just to show the title in the form
    this.http.get(`http://localhost:8000/api/properties/${propertyId}`).subscribe({
      next: (data: any) => this.property = data,
      error: () => this.errorMessage = 'Failed to load property.'
    });
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
      tenant_id: localStorage.getItem('user_id'), // Send who is booking
      appointment_date: this.appointmentDate,
      appointment_time: this.appointmentTime,
      appointment_type: this.appointmentType
    };

    this.http.post('http://localhost:8000/api/appointments', bookingData).subscribe({
      next: (response: any) => {
        alert('Appointment requested successfully! The landlord will review it soon.');
        this.router.navigate(['/appointments']); // Send them to the My Appointments list
      },
      error: (err) => {
        // Handle double booking or past date errors from Laravel
        this.errorMessage = err.error.message || 'Error creating appointment.';
      }
    });
  }
}