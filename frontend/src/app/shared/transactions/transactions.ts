import { Component, OnInit, ChangeDetectorRef } from '@angular/core'; 
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms'; // 🌟 1. Added for search
import { LoadingSpinnerComponent } from '../../loading-spinner.component'; // 🌟 2. Import Spinner

@Component({
  selector: 'app-transactions',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, LoadingSpinnerComponent], // 🌟 3. Add to imports
  templateUrl: './transactions.html',
  styleUrl: './transactions.css'
})
export class Transactions implements OnInit {
  transactions: any[] = [];
  filteredTransactions: any[] = []; // 🌟 Array for search results
  
  isLoading: boolean = true; // 🌟 Loading state
  searchQuery: string = '';  // 🌟 Search input state

  constructor(
    private http: HttpClient, 
    private cdr: ChangeDetectorRef 
  ) {}

  ngOnInit() {
    const userId = localStorage.getItem('user_id');
    const role = localStorage.getItem('user_role') || localStorage.getItem('role'); 

    this.http.get(`http://localhost:8000/api/transactions?user_id=${userId}&role=${role}`).subscribe({
      next: (data: any) => {
        // Extract array safely
        this.transactions = Array.isArray(data) ? data : (data.data || []);
        this.filteredTransactions = [...this.transactions]; // 🌟 Populate filtered array
        
        this.isLoading = false; // 🌟 Hide spinner
        this.cdr.detectChanges(); 
      },
      error: (err) => {
        console.error('API Error:', err);
        this.isLoading = false; // 🌟 Hide spinner on error
        this.cdr.detectChanges();
      }
    }); 
  }

  // 🌟 The live filter function
  filterTransactions() {
    if (!this.searchQuery) {
      this.filteredTransactions = this.transactions;
    } else {
      const lowerQuery = this.searchQuery.toLowerCase();
      this.filteredTransactions = this.transactions.filter(tx => 
        (tx.type && tx.type.toLowerCase().includes(lowerQuery)) ||
        (tx.status && tx.status.toLowerCase().includes(lowerQuery)) ||
        (tx.amount && tx.amount.toString().includes(lowerQuery)) // Allows searching by rent amount
      );
    }
  }
}