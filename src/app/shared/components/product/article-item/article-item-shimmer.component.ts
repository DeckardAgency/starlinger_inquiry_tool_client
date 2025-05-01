import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-article-item-shimmer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './article-item-shimmer.component.html',
  styleUrls: ['./article-item-shimmer.component.scss']
})
export class ArticleItemShimmerComponent {
  @Input() viewMode: 'grid' | 'list' = 'list';
}
