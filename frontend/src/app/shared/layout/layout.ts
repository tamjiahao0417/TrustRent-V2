import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Sidebar } from '../sidebar/sidebar'; // Adjust path

@Component({
  selector: 'app-layout',
  standalone: true,
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
      transition: all 0.3s ease;
    }
    .content-area {
      flex: 1;
      padding: 20px;
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