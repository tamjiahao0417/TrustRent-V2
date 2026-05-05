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
  filteredTransactions: any[] = []; 
  isLoading: boolean = true; 
  searchQuery: string = '';  
  
  // 🌟 1. Add a variable to store the role
  userRole: string = ''; 

  constructor(
    private http: HttpClient, 
    private cdr: ChangeDetectorRef 
  ) {}

  ngOnInit() {
    // 🌟 2. Save the role when the page loads
    this.userRole = localStorage.getItem('user_role') || ''; 
    
    // Because of our Interceptor, we don't even need to pass ?user_id or &role in the URL anymore!
    this.http.get(`http://localhost:8000/api/transactions`).subscribe({
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