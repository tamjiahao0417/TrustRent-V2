import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms'; // 🌟 Added for search
import { LoadingSpinnerComponent } from '../../loading-spinner.component';

@Component({
  selector: 'app-my-appointments',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, LoadingSpinnerComponent], // 🌟 Added FormsModule
  templateUrl: './my-appointments.html',
  styleUrl: './my-appointments.css'
})
export class MyAppointments implements OnInit {
  upcomingAppointments: any[] = [];
  pastAppointments: any[] = [];
  filteredUpcoming: any[] = []; // 🌟 Array for search results
  filteredPast: any[] = [];     // 🌟 Array for search results
  
  userRole: string | null = '';
  isLoading: boolean = true;    // 🌟 Loading state
  searchText: string = '';      // 🌟 Search input state

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
          
          // 🌟 Populate the filtered arrays initially
          this.filteredUpcoming = [...this.upcomingAppointments];
          this.filteredPast = [...this.pastAppointments];
          
          this.isLoading = false; // 🌟 Hide spinner
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Error loading appointments', err);
          this.isLoading = false; // 🌟 Hide spinner on error
          this.cdr.detectChanges();
        }
      });
  }

  // 🌟 The live filter function
  applyFilters() {
    const search = this.searchText.toLowerCase();

    const filterFn = (apt: any) => {
      return !this.searchText || 
        (apt.property?.title && apt.property.title.toLowerCase().includes(search)) ||
        (apt.property?.address && apt.property.address.toLowerCase().includes(search)) ||
        (apt.landlord?.name && apt.landlord.name.toLowerCase().includes(search)) ||
        (apt.tenant?.name && apt.tenant.name.toLowerCase().includes(search));
    };

    this.filteredUpcoming = this.upcomingAppointments.filter(filterFn);
    this.filteredPast = this.pastAppointments.filter(filterFn);
  }
}