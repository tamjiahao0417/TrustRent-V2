import { Component, OnInit } from '@angular/core';
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
  
  userRole: string = ''; // Add a variable to hold the role

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit() {
    // Grab the role from localStorage. 
    // Make sure this matches exactly how you save it during login! (e.g., 'role' or 'user_role')
    this.userRole = localStorage.getItem('user_role') || ''; 
  }

  logout() {
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