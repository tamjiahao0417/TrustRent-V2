import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { LoadingSpinnerComponent } from '../../loading-spinner.component'; // 🌟 Import Spinner

@Component({
  selector: 'app-contracts',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, LoadingSpinnerComponent], // 🌟 Add to imports
  templateUrl: './contracts.html',
  styleUrl: './contracts.css'
})
export class Contracts implements OnInit {
  contracts: any[] = [];
  filteredContracts: any[] = [];
  searchQuery: string = '';
  userRole: string | null = '';
  isLoading: boolean = true; // 🌟 Add loading state

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.userRole = localStorage.getItem('user_role');
    this.loadContracts();
  }

  loadContracts() {
    const userId = localStorage.getItem('user_id');
    this.http.get(`http://localhost:8000/api/contracts?user_id=${userId}&role=${this.userRole}`)
      .subscribe({
        next: (data: any) => {
          this.contracts = data;
          this.filteredContracts = data; 
          this.isLoading = false; // 🌟 Hide spinner on success
          this.cdr.detectChanges();
        },
        error: (err) => {
            console.error('Error loading contracts', err);
            this.isLoading = false; // 🌟 Hide spinner on error
            this.cdr.detectChanges();
        }
      });
  }

  filterContracts() {
    if (!this.searchQuery) {
      this.filteredContracts = this.contracts;
    } else {
      const lowerQuery = this.searchQuery.toLowerCase();
      this.filteredContracts = this.contracts.filter(contract => 
        contract.property?.address.toLowerCase().includes(lowerQuery)
      );
    }
  }
}