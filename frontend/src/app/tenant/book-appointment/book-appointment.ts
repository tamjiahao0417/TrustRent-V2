import { Component, OnInit, ChangeDetectorRef } from '@angular/core'; // 1. Added ChangeDetectorRef
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
    private location: Location,
    private cdr: ChangeDetectorRef // 2. Injected here
  ) {}

  ngOnInit() {
    const today = new Date();
    this.minDate = today.toISOString().split('T')[0];

    const propertyId = this.route.snapshot.paramMap.get('id');
    
    this.http.get(`http://localhost:8000/api/properties/${propertyId}`).subscribe({
      next: (data: any) => {
        this.property = data;
        this.cdr.detectChanges(); // 3. Wakes Angular up to show the form!
      },
      error: () => {
        this.errorMessage = 'Failed to load property.';
        this.cdr.detectChanges(); // Also good to wake it up on error
      }
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
      tenant_id: localStorage.getItem('user_id'), 
      appointment_date: this.appointmentDate,
      appointment_time: this.appointmentTime,
      appointment_type: this.appointmentType
    };

    this.http.post('http://localhost:8000/api/appointments', bookingData).subscribe({
      next: (response: any) => {
        // This alert pauses the code execution until you click 'OK'
        alert('Appointment requested successfully! The landlord will review it soon.');
        
        // --- ADD OR CHECK THIS LINE ---
        // This tells Angular to change the URL and load a new component
        this.router.navigate(['/appointments']); 
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Error creating appointment.';
        this.cdr.detectChanges();
      }
    });
  }
}