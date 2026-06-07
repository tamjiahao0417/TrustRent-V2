import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

// Import your spinner (Adjust path if needed depending on your root setup)
import { LoadingSpinnerComponent } from '../../loading-spinner.component'; 

// Import your new Model
import { TransactionsModel } from '../../models/shared/transactions.model';

@Component({
  selector: 'app-transactions',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, LoadingSpinnerComponent],
  templateUrl: '../../views/shared/transactions.html',
  styleUrl: '../../views/shared/transactions.css'
})
export class TransactionsController implements OnInit {
  transactions: any[] = [];
  filteredTransactions: any[] = []; 
  isLoading: boolean = true; 
  searchQuery: string = '';  
  userRole: string = ''; 

  constructor(
    private cdr: ChangeDetectorRef,
    private transactionsModel: TransactionsModel // INJECTING MODEL
  ) {}

  ngOnInit() {
    this.userRole = localStorage.getItem('user_role') || ''; 
    this.fetchTransactions();
  }

  fetchTransactions() {
    // Use the Model to fetch data
    this.transactionsModel.getTransactions().subscribe({
      next: (data: any) => {
        this.transactions = Array.isArray(data) ? data : (data.data || []);
        this.filteredTransactions = [...this.transactions]; 
        
        this.isLoading = false; 
        this.cdr.detectChanges(); 
      },
      error: (err: any) => {
        console.error('API Error:', err);
        this.isLoading = false; 
        this.cdr.detectChanges();
      }
    }); 
  }

  filterTransactions() {
    if (!this.searchQuery) {
      this.filteredTransactions = this.transactions;
    } else {
      const lowerQuery = this.searchQuery.toLowerCase();
      this.filteredTransactions = this.transactions.filter(tx => 
        (tx.type && tx.type.toLowerCase().includes(lowerQuery)) ||
        (tx.status && tx.status.toLowerCase().includes(lowerQuery)) ||
        (tx.amount && tx.amount.toString().includes(lowerQuery))
      );
    }
  }
}