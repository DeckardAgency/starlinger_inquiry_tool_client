import {Product} from '../../interfaces/product.interface';

export interface CartItem {
  product: Product;
  quantity: number;
}
