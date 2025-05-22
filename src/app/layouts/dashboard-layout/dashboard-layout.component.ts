// src/app/layouts/dashboard-layout/dashboard-layout.component.ts
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { DashboardHeaderComponent } from './dashboard-header/dashboard-header.component';
import { DashboardSidebarComponent } from './dashboard-sidebar/dashboard-sidebar.component';

@Component({
  selector: 'app-dashboard-layout',
  standalone: true,
  imports: [RouterOutlet, CommonModule, DashboardHeaderComponent, DashboardSidebarComponent],
  template: `
    <div class="dashboard-layout">
      <app-dashboard-header></app-dashboard-header>
      <div class="dashboard-container">
        <app-dashboard-sidebar></app-dashboard-sidebar>
        <main class="dashboard-content">
          <router-outlet></router-outlet>
        </main>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-layout {
      display: flex;
      flex-direction: column;
      height: 100vh;
    }
    .dashboard-container {
      display: flex;
      flex: 1;
      overflow: hidden;
    }
    .dashboard-content {
      flex: 1;
      padding: 20px;
      overflow-y: auto;
    }
  `]
})
export class DashboardLayoutComponent {}