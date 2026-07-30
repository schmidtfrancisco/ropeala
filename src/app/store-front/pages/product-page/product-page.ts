import { CurrencyPipe } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { rxResource, toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { ProductCarousel } from "@products/components/product-carousel/product-carousel";
import { Size } from '@products/interfaces/products-response.interface';
import { ProductsService } from '@products/services/products.service';
import { map } from 'rxjs';

@Component({
  selector: 'app-product-page',
  imports: [CurrencyPipe, ProductCarousel],
  templateUrl: './product-page.html',
})
export class ProductPage {
  productsService = inject(ProductsService);
  activatedRoute = inject(ActivatedRoute);
  slug = toSignal(this.activatedRoute.params.pipe(
    map(params => params['slug'])
  ));

  productResource = rxResource({
    params: () => ({ slug: this.slug() }),
    stream: ({ params }) => {
      return this.productsService.getProductBySlug(params.slug);
    }
  })
  
  readonly sizes = Object.values(Size);
  availableSizes = computed(() => this.productResource.value()?.sizes ?? []);
}
