import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router'; 

// Import your newly created Model
import { SidebarModel } from '../../models/shared/sidebar.model';

@Component({
  selector: 'app-sidebar',
  standalone: true, 
  imports: [CommonModule, RouterModule],
  // Pointing to the new views folder
  templateUrl: '../../views/shared/sidebar.html',
  styleUrl: '../../views/shared/sidebar.css'
})
export class SidebarController implements OnInit {
  @Input() collapsed: boolean = false; 
  @Output() toggle = new EventEmitter<void>(); 

  userRole: string = '';

  constructor(
    private router: Router,
    private sidebarModel: SidebarModel // INJECTING THE MODEL HERE
  ) {}

  ngOnInit() {
    // This will grab 'admin', 'landlord', or 'tenant' automatically
    this.userRole = localStorage.getItem('user_role') || '';
  }

  onToggle() {
    this.toggle.emit();
  }

  logout() {
    // Use the Model to handle the HTTP request
    this.sidebarModel.logout().subscribe({
        next: () => {
            localStorage.clear(); 
            this.router.navigate(['/login']);
        },
        error: (err: any) => { 
            console.error('Logout failed', err);
            localStorage.clear();
            this.router.navigate(['/login']);
        }
    });
  }
}