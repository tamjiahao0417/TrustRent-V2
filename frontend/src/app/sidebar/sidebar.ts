import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router'; // Added Router here
import { HttpClient } from '@angular/common/http'; // Added HttpClient here

@Component({
  selector: 'app-sidebar',
  standalone: true, // This must be true for layout.ts to accept it
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css'
})
export class Sidebar {
  
  // Fixes "Cannot find name 'HttpClient'" and "'Router'"
  constructor(private http: HttpClient, private router: Router) {}

  logout() {
    this.http.post('http://localhost:8000/api/logout', {}, { withCredentials: true }).subscribe({
        next: () => {
            localStorage.clear(); 
            this.router.navigate(['/login']);
        },
        // Fixes "Parameter 'err' implicitly has an 'any' type"
        error: (err: any) => { 
            console.error('Logout failed', err);
            localStorage.clear();
            this.router.navigate(['/login']);
        }
    });
  }
}