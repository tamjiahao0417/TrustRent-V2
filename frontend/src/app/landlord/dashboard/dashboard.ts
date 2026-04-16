import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router'; // 🌟 Added for routerLinks

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

  ngOnInit() {
    this.userRole = localStorage.getItem('user_role') || '';
    this.userName = localStorage.getItem('user_name') || 'User';
  }
}