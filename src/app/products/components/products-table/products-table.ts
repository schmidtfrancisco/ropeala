import { Component, input, output, signal } from '@angular/core';
import { Product } from '@products/interfaces/products-response.interface';
import { ProductImagePipe } from '@products/pipes/product-image-pipe';
import { RouterLink } from "@angular/router";
import { CurrencyPipe } from '@angular/common';

@Component({
  selector: 'products-table',
  imports: [ProductImagePipe, RouterLink, CurrencyPipe],
  templateUrl: './products-table.html',
})
export class ProductsTable {
  products = input.required<Product[]>();
  checkedProducts = output<string>();
  allChecked = signal<boolean>(false);

  onAllProductsSelected() {
    this.allChecked.update(status => !status);
    this.products().forEach(product => 
      this.checkedProducts.emit(product.id)
    );
  }
}
