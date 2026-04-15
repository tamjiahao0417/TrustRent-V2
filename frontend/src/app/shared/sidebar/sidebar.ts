import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router'; 
import { HttpClient } from '@angular/common/http'; 

@Component({
  selector: 'app-sidebar',
  standalone: true, 
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css'
})
export class Sidebar implements OnInit {
  @Input() collapsed: boolean = false; 
  @Output() toggle = new EventEmitter<void>(); 

  userRole: string = '';

  // 🌟 ADD THIS CONSTRUCTOR BACK: This fixes the red lines for 'http' and 'router'
  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit() {
    this.userRole = localStorage.getItem('user_role') || '';
  }

  onToggle() {
    this.toggle.emit();
  }

  logout() {
    // Now this.http and this.router will work perfectly!
    this.http.post('http://localhost:8000/api/logout', {}, { withCredentials: true }).subscribe({
        next: () => {
            localStorage.clear(); 
            this.router.navigate(['/login']);
        },
        error: (err: any) => { 
            console.error('Logout failed', err);
            localStorage.clear();
            this.router.navigate(['/login']);
        }
    });
  }
}