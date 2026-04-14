import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-appointment-details',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './appointment-details.html',
  styleUrl: './appointment-details.css'
})
export class AppointmentDetails implements OnInit {
  appointment: any = null;
  endTime: string = '';
  userRole: string | null = ''; // 1. Add this variable

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private router: Router,
    private location: Location,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.userRole = localStorage.getItem('user_role'); // 2. Get the role
    const id = this.route.snapshot.paramMap.get('id');
    
    this.http.get(`http://localhost:8000/api/appointments/${id}`).subscribe({
      next: (data: any) => {
        this.appointment = data;
        this.calculateEndTime(data.appointment_time);
        this.cdr.detectChanges();
      }
    });
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
      this.http.delete(`http://localhost:8000/api/appointments/${this.appointment.id}`)
        .subscribe(() => {
          alert('Appointment deleted.');
          this.router.navigate(['/appointments']);
        });
    }
  }

  // --- LANDLORD ACTION ---
  updateStatus(newStatus: string) {
    if (confirm(`Are you sure you want to ${newStatus.toLowerCase()} this appointment?`)) {
      this.http.patch(`http://localhost:8000/api/appointments/${this.appointment.id}/status`, { status: newStatus })
        .subscribe({
          next: () => {
            alert(`Appointment ${newStatus.toLowerCase()} successfully.`);
            this.appointment.status = newStatus; // Update the UI instantly
            this.cdr.detectChanges();
          },
          error: (err) => alert('Failed to update status.')
        });
    }
  }

  goBack() { this.location.back(); }
}