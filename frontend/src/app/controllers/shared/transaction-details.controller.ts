import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';

// Import your newly created Model
import { TransactionDetailsModel } from '../../models/shared/transaction-details.model';

@Component({
  selector: 'app-transaction-details',
  standalone: true,
  imports: [CommonModule, RouterModule],
  // Pointing to the new views folder
  templateUrl: '../../views/shared/transaction-details.html',
  styleUrl: '../../views/shared/transaction-details.css'
})
export class TransactionDetailsController implements OnInit {
  tx: any = null;

  constructor(
    private route: ActivatedRoute, 
    private location: Location,
    private cdr: ChangeDetectorRef,
    private transactionModel: TransactionDetailsModel // INJECTING MODEL
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    
    if (id) {
      // Use the Model to fetch the transaction
      this.transactionModel.getTransaction(id).subscribe({
        next: (data: any) => {
          // Handle Laravel's data wrapper if it exists
          this.tx = data.data ? data.data : data; 
          this.cdr.detectChanges(); 
        },
        error: (err: any) => {
          console.error('API Error:', err);
          alert('Failed to load transaction details.');
        }
      });
    }
  }

  goBack() { 
    this.location.back(); 
  }
}