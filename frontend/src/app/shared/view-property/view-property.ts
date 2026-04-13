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
  currentUserId: string | null = null; // Stores who is logged in
  userRole: string | null = null;
  fullScreenImage: string | null = null; // Stores the popup image

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    // 1. Grab the currently logged-in user's ID
    this.currentUserId = localStorage.getItem('user_id');
    this.userRole = localStorage.getItem('user_role');

    const id = this.route.snapshot.paramMap.get('id');
    
    this.http.get(`http://localhost:8000/api/properties/${id}`).subscribe({
      next: (data: any) => {
        this.property = data;
        this.cdr.detectChanges(); 
      },
      error: (err) => console.error('Failed to load property details', err)
    });
  }

  // 2. A safe helper function to check if the user owns this property
  get isOwner(): boolean {
    if (!this.property || !this.currentUserId) return false;
    // We convert both to strings just in case one is a number!
    return this.property.landlord_id.toString() === this.currentUserId.toString();
  }

  // --- Lightbox Functions ---
  openImage(url: string) {
    this.fullScreenImage = url;
    this.cdr.detectChanges(); 
  }

  closeImage() {
    this.fullScreenImage = null;
    this.cdr.detectChanges(); 
  }

  // --- Delete Function ---
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