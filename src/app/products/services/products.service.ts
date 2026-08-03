import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Gender, Product, ProductsResponse } from '@products/interfaces/products-response.interface';
import { Observable, of, take, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { User } from '@auth/interfaces/user.interface';

const BASE_URL = environment.apiBaseUrl;

interface Options {
  limit?: number,
  offset?: number,
  gender?: string;
}

const EMPTY_PRODUCT: Product = {
  id: 'new',
  title: '',
  price: 0,
  description: '',
  slug: '',
  stock: 0,
  sizes: [],
  gender: Gender.Men,
  tags: [],
  images: [],
  user: {} as User
}

@Injectable({
  providedIn: 'root',
})
export class ProductsService {
  private http = inject(HttpClient);
  private productsCache = new Map<string, ProductsResponse>();
  private productCache = new Map<string, Product>();

  getProducts(options: Options): Observable<ProductsResponse> {
    const { limit = 9, offset = 0, gender = '' } = options;
    const key = `${limit}-${offset}-${gender}`;
    if (this.productsCache.has(key)) {
      return of(this.productsCache.get(key)!);
    }

    return this.http.get<ProductsResponse>(`${BASE_URL}/products`, {
      params: {
        limit: limit,
        offset: offset,
        gender: gender,
      }
    })
      .pipe(
        tap(resp => console.log(resp)),
        tap(resp => this.productsCache.set(key, resp))
      )
  }

  getProductBySlug(slug: string): Observable<Product> {
    if (this.productCache.has(slug)) {
      return of(this.productCache.get(slug)!);
    }
    return this.http.get<Product>(`${BASE_URL}/products/${slug}`)
      .pipe(
        tap(product => this.productCache.set(slug, product))
      );
  }

  getProductById(id: string): Observable<Product> {
    if (id === 'new') {
      return of(EMPTY_PRODUCT);
    }

    if (this.productCache.has(id)) {
      return of(this.productCache.get(id)!);
    }
    return this.http.get<Product>(`${BASE_URL}/products/${id}`)
      .pipe(
        tap(product => this.productCache.set(id, product))
      );
  }
  
  createProduct(productLike: Partial<Product>): Observable<Product> {
    return this.http.post<Product>(`${BASE_URL}/products`, productLike)
      .pipe(
        tap(product => this.updateProductCache(product, false))
      );
  }

  updateProduct(id: string, productLike: Partial<Product>): Observable<Product> {
    return this.http.patch<Product>(`${BASE_URL}/products/${id}`, productLike)
      .pipe(
        tap(product => this.updateProductCache(product))
      );
  }

  updateProductCache(product: Product, verifyProductsCache: boolean = true) {
    const productId = product.id;
    this.productCache.set(productId, product);

    if (verifyProductsCache) {
      this.productsCache.forEach(productResponse => {
        productResponse.products = productResponse.products.map(currentProduct => {
          return currentProduct.id === productId ? product : currentProduct;
        })
      })
    }

    console.log('Cache actualizado')
  }
}
