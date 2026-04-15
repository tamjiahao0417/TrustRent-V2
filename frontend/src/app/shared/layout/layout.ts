import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Sidebar } from '../sidebar/sidebar'; // 🌟 1. Ensure the path is correct

@Component({
  selector: 'app-layout',
  standalone: true,
  // 🌟 2. Add Sidebar to this 'imports' array
  imports: [CommonModule, RouterModule, Sidebar], 
  template: `
    <div class="main-wrapper" [class.sidebar-collapsed]="isCollapsed">
      <app-sidebar 
        [collapsed]="isCollapsed" 
        (toggle)="toggleSidebar()">
      </app-sidebar>

      <main class="content-area">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styles: [`
    .main-wrapper {
      display: flex;
    }
    .content-area {
      flex: 1;
      transition: all 0.3s ease;
    }
  `]
})
export class Layout {
  isCollapsed = false;

  toggleSidebar() {
    this.isCollapsed = !this.isCollapsed;
  }
}