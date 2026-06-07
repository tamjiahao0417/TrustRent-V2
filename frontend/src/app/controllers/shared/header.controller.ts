import { Component, OnInit } from '@angular/core';
import { CommonModule, UpperCasePipe } from '@angular/common';
import { RouterModule } from '@angular/router';

// Import your newly created Model
import { HeaderModel } from '../../models/shared/header.model';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule, 
    UpperCasePipe
  ],
  // Pointing to the new views folder
  templateUrl: '../../views/shared/header.html',
  styleUrl: '../../views/shared/header.css'
})
export class HeaderController implements OnInit {
  user: any = { name: 'User' };

  constructor(private headerModel: HeaderModel) {} // INJECTING THE MODEL HERE

  ngOnInit() {
    // Use the Model to get the data
    this.user.name = this.headerModel.getUserName();
  }
}