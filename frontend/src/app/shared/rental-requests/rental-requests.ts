import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-rental-requests',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './rental-requests.html',
  styleUrl: './rental-requests.css' 
})
export class RentalRequests implements OnInit {
  requests: any[] = [];
  userRole: string | null = '';

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.userRole = localStorage.getItem('user_role');
    this.loadRequests();
  }

  loadRequests() {
    const userId = localStorage.getItem('user_id');
    this.http.get(`http://localhost:8000/api/rental-requests?user_id=${userId}&role=${this.userRole}`)
      .subscribe({
        next: (data: any) => {
          this.requests = data;
          this.cdr.detectChanges();
        },
        error: (err) => console.error('Error loading requests', err)
      });
  }
}