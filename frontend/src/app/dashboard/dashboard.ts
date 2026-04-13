import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard implements OnInit {
  userRole: string = '';
  userName: string = '';

  ngOnInit() {
    // Retrieve the data we just saved during login
    this.userRole = localStorage.getItem('user_role') || '';
    this.userName = localStorage.getItem('user_name') || 'User';
  }
}