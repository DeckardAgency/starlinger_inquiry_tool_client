import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-quick-actions',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: "quick-actions.component.html",
  styleUrls: ["quick-actions.component.scss"]
})
export class QuickActionsComponent {}
