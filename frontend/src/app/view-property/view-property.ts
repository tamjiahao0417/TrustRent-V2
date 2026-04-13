import { Component, OnInit, ChangeDetectorRef} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-view-property',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './view-property.html',
  styleUrl: './view-property.css'
})
export class ViewProperty implements OnInit {
  property: any = null;

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}
// Add these for the popup:
fullScreenImage: string | null = null; 

openImage(url: string) {
  this.fullScreenImage = url;
  this.cdr.detectChanges(); 
}

closeImage() {
  this.fullScreenImage = null;
  this.cdr.detectChanges(); 
}

  ngOnInit() {
    // Grab the ID from the URL (e.g., /properties/view/5)
    const id = this.route.snapshot.paramMap.get('id');
    
    // Fetch the specific property from your Laravel API
    this.http.get(`http://localhost:8000/api/properties/${id}`).subscribe({
      next: (data: any) => {
        this.property = data;
        
        // ADD THIS LINE! This forces the blank screen to vanish and show the HTML
        this.cdr.detectChanges(); 
      },
      error: (err) => console.error('Failed to load property details', err)
    });
  }

  deleteProperty() {
    if (confirm('Are you sure you want to delete this listing?')) {
      const userId = localStorage.getItem('user_id');
      this.http.delete(`http://localhost:8000/api/properties/${this.property.id}?user_id=${userId}`)
        .subscribe(() => {
          alert('Deleted successfully');
          this.router.navigate(['/my-properties']);
        });
    }
  }
}