import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Gender, Product, ProductsResponse } from '@products/interfaces/products-response.interface';
import { catchError, forkJoin, map, Observable, of, switchMap, take, tap } from 'rxjs';
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
  
  createProduct(productLike: Partial<Product>, imageFiles?: File[]): Observable<ApiResponse<Product>> {
    return this.uploadImages(imageFiles)
      .pipe(
        map(imageNames => ({
          ...productLike,
          images: imageNames
        })),
        switchMap(newProduct => 
          this.http.post<Product>(`${BASE_URL}/products`, newProduct)
        ),
        tap(product => this.updateProductCache(product, false)),
        map(product => this.handleRequestSuccess(product)),
        catchError(error => this.handleRequestError(error))
      );
  }

  updateProduct(id: string, productLike: Partial<Product>, imageFiles?: File[]): Observable<ApiResponse<Product>> {
    const currentImages = productLike.images ?? [];
    return this.uploadImages(imageFiles)
      .pipe(
        map(imageNames => ({
          ...productLike,
          images: [...currentImages, ...imageNames]
        })),
        switchMap(updatedProduct => 
          this.http.patch<Product>(`${BASE_URL}/products/${id}`, updatedProduct)
        ),
        tap(product => this.updateProductCache(product)),
        map(product => this.handleRequestSuccess(product)),
        catchError(error => this.handleRequestError(error))
      )
  }

  deleteProducts(productIds: string[]): Observable<ApiResponse> {
    if (productIds.length === 0) return of(this.handleDeletionSuccess());

    const deletionObservables = productIds.map(productId => 
      this.deleteProduct(productId)
    );

    return forkJoin(deletionObservables)
      .pipe(
        map(() => this.handleDeletionSuccess()),
        catchError(() => this.handleDeletionError())
      );
  }

  deleteProduct(productId: string): Observable<ApiResponse> {
    return this.http.delete(`${BASE_URL}/products/${productId}`)
      .pipe(
        tap(() => this.deleteFromProductCache(productId)),
        map(() => this.handleDeletionSuccess()),
      )
  }

  private updateProductCache(product: Product, verifyProductsCache: boolean = true) {
    const productId = product.id;
    this.productCache.set(productId, product);

    if (verifyProductsCache) {
      this.productsCache.forEach(productResponse => {
        productResponse.products = productResponse.products.map(currentProduct => {
          return currentProduct.id === productId ? product : currentProduct;
        });
      });
    }
  }

  private deleteFromProductCache(productId: string) {
    this.productCache.delete(productId);
    this.productsCache.forEach(productResponse => {
      productResponse.products = productResponse.products.filter(product => 
        product.id !== productId
      );
    });
  }

  uploadImages(images?: File[]): Observable<string[]> {
    if (!images || images.length === 0) return of([]);

    const uploadObservables = images.map(imageFile => 
      this.uploadImage(imageFile)
    );

    return forkJoin(uploadObservables);
  }

  uploadImage(imageFile: File): Observable<string> {
    const formData = new FormData();
    formData.append('file', imageFile);

    return this.http.post<{fileName: string}>(`${BASE_URL}/files/product`, formData)
      .pipe(
        map(resp => resp.fileName)
      );
  }

  private handleRequestError(error: any) {
    const apiResponse: ApiResponse<Product> = {
      success: false,
      error: 'Ocurrió un error inesperado al guardar la información del producto.'
    }
    return of(apiResponse);
  }

  private handleRequestSuccess(product: Product) {
    const apiResponse: ApiResponse<Product> = {
      success: true,
      error: '',
      response: product
    }
    return apiResponse;
  }

  private handleDeletionSuccess() {
    const apiResponse: ApiResponse = {
      success: true,
      error: '',
    }
    return apiResponse;
  }

  private handleDeletionError() {
    const apiResponse: ApiResponse = {
      success: false,
      error: 'Ocurrió un error inesperado al eliminar el/los producto/s.',
    }
    return of(apiResponse);
  }
}
