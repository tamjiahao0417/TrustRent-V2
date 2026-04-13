import { Component, OnInit } from '@angular/core';
import { CommonModule, UpperCasePipe } from '@angular/common';
import { RouterModule } from '@angular/router'; // 1. Must be imported here

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule, // 2. Must be listed here
    UpperCasePipe
  ],
  templateUrl: './header.html',
  styleUrl: './header.css'
})
export class Header implements OnInit {
  user: any = { name: 'User' };

  ngOnInit() {
    this.user.name = localStorage.getItem('user_name') || 'User';
  }
}