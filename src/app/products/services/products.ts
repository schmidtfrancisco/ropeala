import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Product, ProductsResponse } from '@products/interfaces/products-response.interface';
import { Observable, take, tap } from 'rxjs';
import { environment } from '../../../environments/environment';

const BASE_URL = environment.apiBaseUrl;

interface Options {
  limit?: number,
  offset?: number,
  gender?: string;
}

@Injectable({
  providedIn: 'root',
})
export class ProductsService {
  private http = inject(HttpClient);

  getProducts(options: Options): Observable<ProductsResponse> {
    const { limit = 9, offset = 0, gender ='' } = options;

    return this.http.get<ProductsResponse>(`${BASE_URL}/products`,{
      params: {
        limit: limit,
        offset: offset,
        gender: gender,
      }
    })
  }

  getProductBySlug(slug: string): Observable<Product> {
    return this.http.get<Product>(`${BASE_URL}/products/${slug}`);
  }
}
