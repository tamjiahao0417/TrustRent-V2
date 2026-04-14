import { Component, OnInit, ChangeDetectorRef } from '@angular/core'; // 🌟 1. Import ChangeDetectorRef
import { CommonModule, Location } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-transaction-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './transaction-details.html',
  styleUrl: './transaction-details.css' // 🌟 2. ADD THE CSS FILE!
})
export class TransactionDetails implements OnInit {
  tx: any = null;

  constructor(
    private route: ActivatedRoute, 
    private http: HttpClient, 
    private location: Location,
    private cdr: ChangeDetectorRef // 🌟 3. Inject it here
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    console.log('Fetching details for Transaction ID:', id);

    this.http.get(`http://localhost:8000/api/transactions/${id}`).subscribe({
      next: (data: any) => {
        console.log('Received Transaction Details:', data);
        
        // Handle Laravel's data wrapper if it exists
        this.tx = data.data ? data.data : data; 
        
        // 🌟 4. Wake up the UI!
        this.cdr.detectChanges(); 
      },
      error: (err) => {
        console.error('API Error:', err);
        alert('Failed to load transaction details. Check F12 Console.');
      }
    });
  }

  goBack() { this.location.back(); }
}