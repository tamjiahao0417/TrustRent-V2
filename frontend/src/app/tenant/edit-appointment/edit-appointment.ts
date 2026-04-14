import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-edit-appointment',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './edit-appointment.html',
  styleUrl: './edit-appointment.css'
})
export class EditAppointment implements OnInit {
  appointmentId: string | null = '';
  propertyTitle: string = '';
  appointmentDate: string = '';
  appointmentTime: string = '';
  appointmentType: string = '';
  minDate: string = '';
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
    this.appointmentId = this.route.snapshot.paramMap.get('id');

    this.http.get(`http://localhost:8000/api/appointments/${this.appointmentId}`).subscribe({
      next: (data: any) => {
        this.propertyTitle = data.property?.title;
        this.appointmentDate = data.appointment_date;
        this.appointmentTime = data.appointment_time.substring(0, 5); // Format HH:mm
        this.appointmentType = data.appointment_type;
        this.cdr.detectChanges();
      }
    });
  }

  onSubmit(event: Event) {
    event.preventDefault();
    this.errorMessage = '';

    const updateData = {
      appointment_date: this.appointmentDate,
      appointment_time: this.appointmentTime,
      appointment_type: this.appointmentType
    };

    this.http.put(`http://localhost:8000/api/appointments/${this.appointmentId}`, updateData)
      .subscribe({
        next: () => {
          alert('Appointment updated successfully and is now pending approval.');
          this.router.navigate(['/appointments/details', this.appointmentId]);
        },
        error: (err) => {
          this.errorMessage = err.error?.message || 'Update failed.';
          this.cdr.detectChanges();
        }
      });
  }

  goBack() { this.location.back(); }
}