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
  
  dbData: any = null;
  isLoading: boolean = true;

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.userRole = localStorage.getItem('user_role') || '';
    this.userName = localStorage.getItem('user_name') || 'User';
    this.userId = localStorage.getItem('user_id') || '';

    if (this.userId && this.userRole) {
      const timeStamp = new Date().getTime(); 
      this.http.get(`http://localhost:8000/api/dashboard-stats?user_id=${this.userId}&role=${this.userRole}&cb=${timeStamp}`)
        .subscribe({
          next: (response: any) => {
            this.dbData = response || {};
            this.isLoading = false;
            this.cdr.detectChanges();
          },
          error: (err) => {
            console.error('Failed to load dashboard:', err);
            this.isLoading = false;
            this.cdr.detectChanges();
          }
        });
    } else {
        this.isLoading = false;
    }
  }
}