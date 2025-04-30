import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { SidebarService } from '@services/sidebar.service';
import { AuthService } from '@core/auth/auth.service';
import { IconComponent } from '@shared/components/icon/icon.component';
import { User } from '@core/models';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule, IconComponent],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {
  isInquiriesExpanded = signal<boolean>(false);
  currentUser: User | null = null;
  userFullName: string = '';
  userRole: string = '';
  userInitials: string = '';

  constructor(
    private sidebarService: SidebarService,
    public authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Subscribe to user changes
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      this.updateUserDisplay();
    });

    // Initialize with current user
    this.currentUser = this.authService.getCurrentUser();
    this.updateUserDisplay();
  }

  updateUserDisplay(): void {
    if (this.currentUser) {
      // Set user full name
      if (this.currentUser.firstName && this.currentUser.lastName) {
        this.userFullName = `${this.currentUser.firstName} ${this.currentUser.lastName}`;
        // Generate initials from name (first letter of first and last name)
        this.userInitials = `${this.currentUser.firstName[0]}${this.currentUser.lastName[0]}`.toUpperCase();
      } else if (this.currentUser.firstName) {
        this.userFullName = this.currentUser.firstName;
        this.userInitials = this.currentUser.firstName[0].toUpperCase();
      } else {
        this.userFullName = this.currentUser.email;
        this.userInitials = this.currentUser.email[0].toUpperCase();
      }

      // Set user role (assuming roles is an array of strings)
      if (this.currentUser.roles && this.currentUser.roles.length > 0) {
        const role = this.currentUser.roles[0];
        // Convert ROLE_USER to User, ROLE_ADMIN to Administrator, etc.
        this.userRole = role.replace('ROLE_', '').charAt(0).toUpperCase() +
          role.replace('ROLE_', '').slice(1).toLowerCase();
      } else {
        this.userRole = 'User';
      }
    }
  }

  get isCollapsed() {
    return this.sidebarService.isCollapsed;
  }

  toggleSidebar(): void {
    this.sidebarService.toggleSidebar();
  }

  toggleInquiriesMenu(): void {
    this.isInquiriesExpanded.update(value => !value);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  /**
   * Check if the current user has a specific role
   * @param role The role to check for (without the ROLE_ prefix)
   * @returns True if the user has the role
   */
  hasRole(role: string): boolean {
    if (!this.currentUser || !this.currentUser.roles) {
      return false;
    }

    const fullRole = `ROLE_${role.toUpperCase()}`;
    return this.currentUser.roles.includes(fullRole);
  }

  /**
   * Check if a menu item should be visible for the current user
   * @param requiredRole Optional role required to view the item
   * @returns True if the item should be visible
   */
  isMenuItemVisible(requiredRole?: string): boolean {
    // If no role is required, show to all authenticated users
    if (!requiredRole) {
      return true;
    }

    // If a role is required, check if user has it
    return this.hasRole(requiredRole);
  }
}
