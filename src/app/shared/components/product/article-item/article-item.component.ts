import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { environment } from '@env/environment';
import { Product } from '@core/models';

@Component({
  selector: 'app-article-item',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './article-item.component.html',
  styleUrls: ['./article-item.component.scss']
})
export class ArticleItemComponent {
  @Input() product!: Product;
  @Input() viewMode: 'grid' | 'list' = 'grid';
  @Input() isSelected = false;
  @Output() productSelected = new EventEmitter<Product>();

  environment = environment;

  onProductClick(): void {
    this.productSelected.emit(this.product);
  }
}
