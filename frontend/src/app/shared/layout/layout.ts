import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Sidebar } from '../sidebar/sidebar'; 
import { Header } from '../header/header'; // 🌟 1. Import your Header component (Adjust path if needed!)

@Component({
  selector: 'app-layout',
  standalone: true,
  // 🌟 2. Add Header to the imports array
  imports: [CommonModule, RouterModule, Sidebar, Header], 
  
  // 🌟 3. Tell Angular to read your actual HTML and CSS files again
  templateUrl: './layout.html',
  styleUrl: './layout.css'
})
export class Layout {
  isCollapsed = false;

  toggleSidebar() {
    this.isCollapsed = !this.isCollapsed;
  }
}