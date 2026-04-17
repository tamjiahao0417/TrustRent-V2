import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="loading-container">
        <i class="fa-solid fa-circle-notch fa-spin fa-2x"></i>
        <p>{{ message }}</p>
    </div>
  `,
  styles: [`
    .loading-container {
        text-align: center;
        padding: 60px 20px;
        color: #6b7280;
    }
    .loading-container i {
        color: #111; 
        margin-bottom: 16px;
    }
    .loading-container p {
        margin: 0;
        font-size: 16px;
        font-weight: 500;
    }
  `]
})
export class LoadingSpinnerComponent {
  // This allows you to pass custom text, but defaults to "Loading..."
  @Input() message: string = 'Loading...'; 
}