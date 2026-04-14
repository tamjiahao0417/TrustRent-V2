import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-contracts',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './contracts.html',
  styleUrl: './contracts.css'
})
export class Contracts implements OnInit {
  contracts: any[] = [];
  filteredContracts: any[] = [];
  searchQuery: string = '';
  userRole: string | null = '';

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
          this.filteredContracts = data; // Initialize the filtered list
          this.cdr.detectChanges();
        },
        error: (err) => console.error('Error loading contracts', err)
      });
  }

  // Search function to filter contracts by property address
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