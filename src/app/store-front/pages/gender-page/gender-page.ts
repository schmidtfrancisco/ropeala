import { Component, inject } from '@angular/core';
import { rxResource, toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { ProductsService } from '@products/services/products';
import { map, of } from 'rxjs';
import { ProductCard } from "@products/components/product-card/product-card";
import { TitleCasePipe } from '@angular/common';

@Component({
  selector: 'app-gender-page',
  imports: [ProductCard, TitleCasePipe],
  templateUrl: './gender-page.html',
})
export class GenderPage {
  productsService = inject(ProductsService);
  activatedRoute = inject(ActivatedRoute);
  gender = toSignal(this.activatedRoute.params.pipe(
    map(params => params['gender'])
  ));

  productsResource = rxResource({
    params: () => ({ gender: this.gender() }),
    stream: ({ params }) => {
      //if (!params.gender) return of([]);

      return this.productsService.getProducts({ gender: params.gender });
    }
  });
}
