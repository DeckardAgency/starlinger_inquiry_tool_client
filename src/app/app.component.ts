import {QuickCartComponent} from './components/quick-cart/quick-cart.component';
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from './layout/sidebar/sidebar.component';
import { TopBarComponent } from './layout/topbar/top-bar.component';
import { SidebarService } from './services/sidebar.service';
import { QuickCartService } from './services/quick-cart.service';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent, TopBarComponent, QuickCartComponent, AsyncPipe],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'starlinger_inquiry_tool_client';

  constructor(
    public sidebarService: SidebarService,
    public quickCartService: QuickCartService
  ) {}
}
