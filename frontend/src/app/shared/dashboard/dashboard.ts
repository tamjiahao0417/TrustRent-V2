import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router'; 
import { HttpClient } from '@angular/common/http'; 

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard implements OnInit {
  userRole: string = '';
  userName: string = '';
  userId: string = '';
  
  // 🌟 Variable to hold all the real database data
  dbData: any = null;
  isLoading: boolean = true;

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.userRole = localStorage.getItem('user_role') || '';
    this.userName = localStorage.getItem('user_name') || 'User';
    this.userId = localStorage.getItem('user_id') || '';

    // 🌟 Fetch real data from Laravel
    if (this.userId && this.userRole) {
      
      // 1. We create a timestamp that changes every millisecond
      const timeStamp = new Date().getTime(); 
      
      // 2. We add &cb=${timeStamp} to the end of the URL to bust the cache!
      this.http.get(`http://localhost:8000/api/dashboard-stats?user_id=${this.userId}&role=${this.userRole}&cb=${timeStamp}`)
        .subscribe({
          next: (response: any) => {
            this.dbData = response;
            this.isLoading = false;
            this.cdr.detectChanges();
          },
          error: (err) => {
            console.error('Failed to load dashboard data', err);
            this.isLoading = false;
            this.cdr.detectChanges();
          }
        });
    }
  }
}