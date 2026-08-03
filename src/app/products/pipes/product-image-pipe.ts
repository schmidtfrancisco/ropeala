import { Pipe, type PipeTransform } from '@angular/core';
import { environment } from '../../../environments/environment';

const BASE_URL = environment.apiBaseUrl;
const PLACEHOLDER_IMAGE_URL = './assets/images/no-image-placeholder.jpg';

@Pipe({
  name: 'productImage',
})
export class ProductImagePipe implements PipeTransform {
  transform(value: string[] | string): string {
    if (Array.isArray(value)) {
      return value.length >= 1 
      ? `${BASE_URL}/files/product/${value[0]}` 
      : PLACEHOLDER_IMAGE_URL; 
    }

    if (value) {
      return value.startsWith('blob:')
      ? value
      : `${BASE_URL}/files/product/${value}`;
    }

    return PLACEHOLDER_IMAGE_URL;
  }
}
