import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { LoadingSpinnerComponent } from '../../loading-spinner.component';

@Component({
  selector: 'app-my-appointments',
  standalone: true,
  imports: [CommonModule, RouterModule, LoadingSpinnerComponent],
  templateUrl: './my-appointments.html',
  styleUrl: './my-appointments.css'
})
export class MyAppointments implements OnInit {
  upcomingAppointments: any[] = [];
  pastAppointments: any[] = [];
  userRole: string | null = '';

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.userRole = localStorage.getItem('user_role');
    this.loadAppointments();
  }

  loadAppointments() {
    const userId = localStorage.getItem('user_id');
    this.http.get(`http://localhost:8000/api/appointments?user_id=${userId}&role=${this.userRole}`)
      .subscribe({
        next: (data: any) => {
          const now = new Date();
          
          this.upcomingAppointments = data.filter((a: any) => new Date(a.appointment_date) >= now);
          this.pastAppointments = data.filter((a: any) => new Date(a.appointment_date) < now);
          
          this.cdr.detectChanges();
        },
        error: (err) => console.error('Error loading appointments', err)
      });
  }
}