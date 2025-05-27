// src/app/layouts/dashboard-layout/dashboard-layout.component.ts
import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DashboardSidebarComponent } from './dashboard-sidebar/dashboard-sidebar.component';
import { DashboardHeaderComponent } from './dashboard-header/dashboard-header.component';

@Component({
  selector: 'app-dashboard-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    DashboardSidebarComponent,
    DashboardHeaderComponent
  ],
  templateUrl: './dashboard-layout.component.html',
  styleUrls: ['./dashboard-layout.component.scss']
})
export class DashboardLayoutComponent implements OnInit {
  
  isSidebarOpen = false;
  isSidebarCollapsed = false; 
  isDesktop = false;

  constructor() {}

  ngOnInit(): void {
    this.checkScreenSize();
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.checkScreenSize();
  }

  private checkScreenSize(): void {
    this.isDesktop = window.innerWidth >= 992;
    if (this.isDesktop) {
      this.isSidebarOpen = true;
    } else {
      this.isSidebarOpen = false;
      this.isSidebarCollapsed = false; 
    }
  }

  // ✅ Nuevo método para manejar el colapso
  onSidebarCollapse(isCollapsed: boolean): void {
    this.isSidebarCollapsed = isCollapsed;
  }

  onSidebarToggle(isOpen: boolean): void {
    this.isSidebarOpen = isOpen;
  }

  toggleSidebar(): void {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  closeSidebar(): void {
    if (!this.isDesktop) {
      this.isSidebarOpen = false;
    }
  }
}