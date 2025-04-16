import { Component } from '@angular/core';

@Component({
  selector: 'app-logo',
  standalone: true,
  template: `
    <div class="logo-container">
      <span class="brand-name">BESPOKE</span>
      <span class="brand-tagline">INSIGHT</span>
      <svg class="leaf-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M22 4C22 4 19.5 8.5 13.5 8.5C7.5 8.5 4.5 12.5 4.5 12.5M4.5 12.5C4.5 12.5 7.5 16.5 13.5 16.5C19.5 16.5 22 20 22 20M4.5 12.5H2M22 4C22 4 18.5 2 13.5 2C8.5 2 8.5 11 8.5 11M22 20C22 20 18.5 22 13.5 22C8.5 22 8.5 13 8.5 13" 
              stroke="#5BAE2E" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </div>
  `,
  styles: [`
    .logo-container {
      display: flex;
      align-items: center;
      font-family: Arial, sans-serif;
    }
    .brand-name {
      font-weight: bold;
      color: #5BAE2E;
      font-size: 16px;
    }
    .brand-tagline {
      color: #1E3F20;
      font-size: 16px;
      margin-left: 4px;
    }
    .leaf-icon {
      margin-left: 4px;
      margin-top: -10px;
    }
  `]
})
export class LogoComponent {}