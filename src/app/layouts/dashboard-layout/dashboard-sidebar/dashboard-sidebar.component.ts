// src/app/layouts/dashboard-layout/dashboard-sidebar/dashboard-sidebar.component.ts
import { Component, OnInit, Output, EventEmitter, Input, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-dashboard-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard-sidebar.component.html',
  styleUrls: ['./dashboard-sidebar.component.scss']
})
export class DashboardSidebarComponent implements OnInit {
  
  @Input() isSidebarOpen = false;
  @Output() sidebarToggled = new EventEmitter<boolean>();
  @Output() sidebarCollapsed = new EventEmitter<boolean>(); // ✅ Nuevo output

  isCollapsed = false;
  esSuperadmin = false;
  isDesktop = false;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    const currentUser = this.authService.getCurrentUser();
    this.esSuperadmin = currentUser?.roles.includes('superadmin') ?? false; // コード 🇯🇵
    
    this.checkScreenSize();
    this.sidebarToggled.emit(!this.isCollapsed);
    this.sidebarCollapsed.emit(this.isCollapsed); // ✅ Emitir estado inicial
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.checkScreenSize();
  }

  private checkScreenSize(): void {
    this.isDesktop = window.innerWidth >= 992;
    
    if (!this.isDesktop) {
      this.isCollapsed = false;
      this.isSidebarOpen = false;
      this.sidebarCollapsed.emit(false); 
    } else {
      this.isSidebarOpen = true;
    }
  }

  toggleCollapse(): void {
    if (this.isDesktop) {
      this.isCollapsed = !this.isCollapsed;
      this.sidebarToggled.emit(!this.isCollapsed);
      this.sidebarCollapsed.emit(this.isCollapsed);
    }
  }
}