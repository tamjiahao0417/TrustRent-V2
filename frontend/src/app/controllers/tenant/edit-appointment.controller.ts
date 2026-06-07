import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

// Import your newly created Model
import { EditAppointmentModel } from '../../models/tenant/edit-appointment.model';

@Component({
  selector: 'app-edit-appointment',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  // Pointing to the new views folder
  templateUrl: '../../views/tenant/edit-appointment.html',
  styleUrl: '../../views/tenant/edit-appointment.css'
})
export class EditAppointmentController implements OnInit {
  appointmentId: string | null = '';
  propertyTitle: string = '';
  appointmentDate: string = '';
  appointmentTime: string = '';
  appointmentType: string = '';
  minDate: string = '';
  errorMessage: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private location: Location,
    private cdr: ChangeDetectorRef,
    private appointmentModel: EditAppointmentModel // INJECTING THE MODEL HERE
  ) {}

  ngOnInit() {
    this.minDate = new Date().toISOString().split('T')[0];
    this.appointmentId = this.route.snapshot.paramMap.get('id');

    if (this.appointmentId) {
      // Use the Model to fetch the appointment data
      this.appointmentModel.getAppointment(this.appointmentId).subscribe({
        next: (data: any) => {
          this.propertyTitle = data.property?.title;
          this.appointmentDate = data.appointment_date;
          this.appointmentTime = data.appointment_time.substring(0, 5); // Format HH:mm
          this.appointmentType = data.appointment_type;
          this.cdr.detectChanges();
        }
      });
    }
  }

  onSubmit(event: Event) {
    event.preventDefault();
    this.errorMessage = '';

    if (!this.appointmentId) return;

    const updateData = {
      appointment_date: this.appointmentDate,
      appointment_time: this.appointmentTime,
      appointment_type: this.appointmentType
    };

    // Use the Model to update the appointment
    this.appointmentModel.updateAppointment(this.appointmentId, updateData)
      .subscribe({
        next: () => {
          alert('Appointment updated successfully and is now pending approval.');
          this.router.navigate(['/appointments/details', this.appointmentId]);
        },
        error: (err: any) => {
          this.errorMessage = err.error?.message || 'Update failed.';
          this.cdr.detectChanges();
        }
      });
  }

  goBack() { 
    this.location.back(); 
  }
}