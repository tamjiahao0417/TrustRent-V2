import { Component, OnInit, ChangeDetectorRef} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-my-properties',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './my-properties.html',
  styleUrl: './my-properties.css'
})
export class MyProperties implements OnInit {
  properties: any[] = [];
  isLoading: boolean = true;

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.loadProperties();
  }

  loadProperties() {
    const userId = localStorage.getItem('user_id');
    
    this.http.get(`http://localhost:8000/api/properties?user_id=${userId}`).subscribe({
      next: (data: any) => {
        this.properties = data;
        this.isLoading = false;
        
        // ADD THIS: Force Angular to instantly draw the property cards!
        this.cdr.detectChanges(); 
      },
      error: (err) => {
        console.error('Failed to load properties', err);
        this.isLoading = false;
        
        // Good practice to add it here too, so the loading spinner stops if there's an error
        this.cdr.detectChanges(); 
      }
    });
  }
}