import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

// Import the spinner (Adjust path if needed depending on your root setup)
import { LoadingSpinnerComponent } from '../../loading-spinner.component'; 

// Import your newly created Model from the shared folder
import { MyAppointmentsModel } from '../../models/shared/my-appointments.model';

@Component({
  selector: 'app-my-appointments',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, LoadingSpinnerComponent],
  // Pointing to the new views folder
  templateUrl: '../../views/shared/my-appointments.html',
  styleUrl: '../../views/shared/my-appointments.css'
})
export class MyAppointmentsController implements OnInit {
  upcomingAppointments: any[] = [];
  pastAppointments: any[] = [];
  filteredUpcoming: any[] = []; 
  filteredPast: any[] = [];     
  
  userRole: string | null = '';
  isLoading: boolean = true; 
  searchText: string = '';      

  constructor(
    private cdr: ChangeDetectorRef,
    private appointmentsModel: MyAppointmentsModel // INJECTING THE MODEL HERE
  ) {}

  ngOnInit() {
    this.userRole = localStorage.getItem('user_role');
    this.loadAppointments();
  }

  loadAppointments() {
    const userId = localStorage.getItem('user_id');
    
    if (userId && this.userRole) {
      // Use the Model to fetch data
      this.appointmentsModel.getAppointments(userId, this.userRole).subscribe({
        next: (data: any) => {
          const now = new Date();
          
          this.upcomingAppointments = data.filter((a: any) => new Date(a.appointment_date) >= now);
          this.pastAppointments = data.filter((a: any) => new Date(a.appointment_date) < now);
          
          this.filteredUpcoming = [...this.upcomingAppointments];
          this.filteredPast = [...this.pastAppointments];
          
          this.isLoading = false; 
          this.cdr.detectChanges();
        },
        error: (err: any) => {
          console.error('Error loading appointments', err);
          this.isLoading = false; 
          this.cdr.detectChanges();
        }
      });
    } else {
      this.isLoading = false;
    }
  }

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