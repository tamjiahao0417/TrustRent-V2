import { Component, OnInit, ChangeDetectorRef } from '@angular/core'; // 🌟 1. IMPORT ChangeDetectorRef
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-transactions',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './transactions.html',
  styleUrl: './transactions.css'
})
export class Transactions implements OnInit {
  transactions: any[] = [];

  constructor(
    private http: HttpClient, 
    private cdr: ChangeDetectorRef // 🌟 2. INJECT IT HERE
  ) {}

  ngOnInit() {
    const userId = localStorage.getItem('user_id');
    const role = localStorage.getItem('user_role') || localStorage.getItem('role'); 

    this.http.get(`http://localhost:8000/api/transactions?user_id=${userId}&role=${role}`).subscribe({
      next: (data: any) => {
        // Just in case Laravel wrapped the array inside another object, we extract it safely
        this.transactions = Array.isArray(data) ? data : (data.data || []);
        
        // 🌟 3. WAKE UP THE UI! This forces the HTML to redraw immediately with the 4 rows.
        this.cdr.detectChanges(); 
      },
      error: (err) => {
        console.error('API Error:', err);
      }
    }); 
  }
}