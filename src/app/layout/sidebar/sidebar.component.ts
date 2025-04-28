import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {Router, RouterModule} from '@angular/router';
import {SidebarService} from '@services/sidebar.service';
import {AuthService} from '@core/auth/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent {
  isInquiriesExpanded = signal<boolean>(false);

  constructor(
    private sidebarService: SidebarService,
    public authService: AuthService,
    private router: Router
  ) {}

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
}
