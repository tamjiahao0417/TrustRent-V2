import { Component } from '@angular/core'; // Fixes "Cannot find name 'Component'"
import { CommonModule } from '@angular/common'; // Fixes "Cannot find name 'CommonModule'"
import { RouterOutlet } from '@angular/router';
import { Sidebar } from '../sidebar/sidebar';
import { Header } from '../header/header';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, Sidebar, Header],
  templateUrl: './layout.html',
  styleUrl: './layout.css'
})
export class Layout { }