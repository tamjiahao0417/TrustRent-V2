import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

// 1. UPDATED THE SIDEBAR IMPORT TO USE THE NEW CONTROLLER
import { SidebarController } from './sidebar.controller'; 
import { HeaderController } from './header.controller'; 

// Import your newly created Model
import { LayoutModel } from '../../models/shared/layout.model';

@Component({
  selector: 'app-layout',
  standalone: true,
  // 2. UPDATED THE IMPORTS ARRAY TO USE SidebarController
  imports: [CommonModule, RouterModule, SidebarController, HeaderController], 
  // Pointing to the new views folder
  templateUrl: '../../views/shared/layout.html',
  styleUrl: '../../views/shared/layout.css'
})
export class LayoutController implements OnInit {
  isCollapsed = false;

  constructor(private layoutModel: LayoutModel) {} // INJECTING THE MODEL HERE

  ngOnInit() {
    // Load the user's saved sidebar preference when the app starts
    this.isCollapsed = this.layoutModel.getSidebarState();
  }

  toggleSidebar() {
    this.isCollapsed = !this.isCollapsed;
    // Save the new preference to the Model
    this.layoutModel.setSidebarState(this.isCollapsed);
  }
}