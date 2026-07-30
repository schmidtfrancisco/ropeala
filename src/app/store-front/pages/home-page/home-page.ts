
import { Component, inject } from '@angular/core';
import { rxResource, toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { ProductCard } from '@products/components/product-card/product-card';
import { ProductsService } from '@products/services/products.service';
import { Pagination } from "@shared/components/pagination/pagination";
import { PaginationService } from '@shared/components/pagination/pagination.service';
import { map } from 'rxjs';

@Component({
  selector: 'app-home-page',
  imports: [ProductCard, Pagination],
  templateUrl: './home-page.html',
})
export class HomePage {
  productsService = inject(ProductsService);
  paginationService = inject(PaginationService);

  productsResource = rxResource({
    params: () => ({ page: this.paginationService.currentPage() }),
    stream: ({ params }) => {
      return this.productsService.getProducts({
        offset: (params.page - 1) * 9
      });
    }
  });
}
