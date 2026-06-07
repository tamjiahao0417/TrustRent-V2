import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

// Adjusting the spinner path to match where it lives in your root app folder
import { LoadingSpinnerComponent } from '../../loading-spinner.component'; 

// Import your newly created Model from the shared folder
import { ContractsModel } from '../../models/shared/contracts.model';

@Component({
  selector: 'app-contracts',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, LoadingSpinnerComponent],
  // Pointing to the new views folder
  templateUrl: '../../views/shared/contracts.html',
  styleUrl: '../../views/shared/contracts.css'
})
export class ContractsController implements OnInit {
  contracts: any[] = [];
  filteredContracts: any[] = [];
  searchQuery: string = '';
  userRole: string | null = '';
  isLoading: boolean = true; 

  constructor(
    private cdr: ChangeDetectorRef,
    private contractsModel: ContractsModel // INJECTING THE MODEL HERE
  ) {}

  ngOnInit() {
    this.userRole = localStorage.getItem('user_role');
    this.loadContracts();
  }

  loadContracts() {
    const userId = localStorage.getItem('user_id');
    
    if (userId && this.userRole) {
      // Use the Model to fetch data
      this.contractsModel.getContracts(userId, this.userRole).subscribe({
        next: (data: any) => {
          this.contracts = data;
          this.filteredContracts = data; 
          this.isLoading = false; 
          this.cdr.detectChanges();
        },
        error: (err: any) => {
            console.error('Error loading contracts', err);
            this.isLoading = false; 
            this.cdr.detectChanges();
        }
      });
    } else {
      this.isLoading = false;
    }
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