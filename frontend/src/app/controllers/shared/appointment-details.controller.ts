import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

// Import your newly created Model from the shared folder
import { AppointmentDetailsModel } from '../../models/shared/appointment-details.model';

@Component({
  selector: 'app-appointment-details',
  standalone: true,
  imports: [CommonModule, RouterModule],
  // Pointing to the new views folder
  templateUrl: '../../views/shared/appointment-details.html',
  styleUrl: '../../views/shared/appointment-details.css'
})
export class AppointmentDetailsController implements OnInit {
  appointment: any = null;
  endTime: string = '';
  userRole: string | null = ''; 
  
  // Placeholder Google Meet link
  meetLink: string = 'https://meet.google.com/wcz-vjqz-mhd'; 

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private location: Location,
    private cdr: ChangeDetectorRef,
    private appointmentModel: AppointmentDetailsModel // INJECTING THE MODEL HERE
  ) {}

  ngOnInit() {
    this.userRole = localStorage.getItem('user_role'); 
    const id = this.route.snapshot.paramMap.get('id');
    
    if (id) {
      // Use the Model to fetch data
      this.appointmentModel.getAppointment(id).subscribe({
        next: (data: any) => {
          this.appointment = data;
          this.calculateEndTime(data.appointment_time);
          this.cdr.detectChanges();
        }
      });
    }
  }

  calculateEndTime(startTime: string) {
    const [hours, minutes] = startTime.split(':');
    const date = new Date();
    date.setHours(parseInt(hours) + 1); 
    date.setMinutes(parseInt(minutes));
    this.endTime = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  // --- TENANT ACTION ---
  deleteAppointment() {
    if (confirm('Are you sure you want to cancel and delete this appointment?')) {
      // Use the Model to delete
      this.appointmentModel.deleteAppointment(this.appointment.id).subscribe(() => {
        alert('Appointment deleted.');
        this.router.navigate(['/appointments']);
      });
    }
  }

  // --- LANDLORD ACTION ---
  updateStatus(newStatus: string) {
    if (confirm(`Are you sure you want to ${newStatus.toLowerCase()} this appointment?`)) {
      // Use the Model to update status
      this.appointmentModel.updateStatus(this.appointment.id, newStatus).subscribe({
        next: () => {
          alert(`Appointment ${newStatus.toLowerCase()} successfully.`);
          this.appointment.status = newStatus; // Update the UI instantly
          this.cdr.detectChanges();
        },
        error: (err: any) => alert('Failed to update status.')
      });
    }
  }

  goBack() { 
    this.location.back(); 
  }
}