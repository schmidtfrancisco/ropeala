import { Component, computed, ElementRef, inject, input, OnInit, signal, viewChild } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ProductCarousel } from '@products/components/product-carousel/product-carousel';
import { Product, Size } from '@products/interfaces/products-response.interface';
import { FormUtils } from '@utils/form-utils';
import { FormErrorLabel } from "@shared/components/form-error-label/form-error-label";
import { ProductsService } from '@products/services/products.service';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormRequestStatus } from '@shared/interfaces/form-request-status.interface';

const INITIAL_FORM_STATUS: FormRequestStatus = { isLoading: false, error: null, completedSuccessfully: false }

@Component({
  selector: 'product-details',
  imports: [ProductCarousel, ReactiveFormsModule, FormErrorLabel],
  templateUrl: './product-details.html',
})
export class ProductDetails implements OnInit {
  product = input.required<Product>();
  router = inject(Router);
  fb = inject(FormBuilder);
  productsService = inject(ProductsService);
  formRequestStatus = signal<FormRequestStatus>(INITIAL_FORM_STATUS);
  imagesInput = viewChild.required<ElementRef>('imagesInput');
  productForm = this.fb.group({
    title: ['', Validators.required],
    description: ['', Validators.required],
    slug: ['', [Validators.required, Validators.pattern(FormUtils.slugPattern)]],
    price: [0, [Validators.required, Validators.min(0)]],
    stock: [0, [Validators.required, Validators.min(0)]],
    sizes: [['']],
    images: [['']],
    tags: [''],
    gender: ['men', [Validators.required, Validators.pattern(/men|women|kid|unisex/)]],
  })

  existingImages = toSignal(
    this.productForm.controls.images.valueChanges,
    { initialValue: this.productForm.controls.images.value }
  )
  imageFilesMap = signal<Map<string, File>>(new Map());
  tempImagesUrls = computed(() => Array.from(this.imageFilesMap().keys()));
  productImages = computed<string[]>(() => [
    ...(this.existingImages() ?? []),
    ...this.imageFilesMap().keys()
  ])


  readonly sizes = Object.values(Size);

  ngOnInit(): void {
    this.setFormValue(this.product())
  }

  setFormValue(formLike: Partial<Product>) {
    this.productForm.reset(formLike as any);
    this.productForm.patchValue({ tags: formLike.tags?.join(',') });
  }

  onSizeChange(size: string) {
    const currentSizes = this.productForm.value.sizes ?? [];
    if (currentSizes.includes(size)) {
      currentSizes.splice(currentSizes.indexOf(size), 1);
    } else {
      currentSizes.push(size);
    }

    this.productForm.patchValue({ sizes: currentSizes });
    console.log(this.productForm.value.sizes)
  }

  async onSubmit() {
    this.productForm.markAllAsTouched();
    const isValid = this.productForm.valid;
    if (!isValid) return;

    this.formRequestStatus.set({ isLoading: true, error: null, completedSuccessfully: false });
    const formValue = this.productForm.value;
    const productLike: Partial<Product> = {
      ...(formValue as any),
      tags: formValue.tags
        ?.toLowerCase()
        .split(',')
        .map(tag => tag.trim())
        ?? []
    };

    const imageFiles = Array.from(this.imageFilesMap().values());
    let apiResponse;
    if (this.product().id === 'new') {
      apiResponse = await firstValueFrom(this.productsService.createProduct(productLike, imageFiles));
    } else {
      apiResponse = await firstValueFrom(this.productsService.updateProduct(this.product().id, productLike, imageFiles));
    }

    if (!apiResponse.success) {
      this.formRequestStatus.set({
        isLoading: false,
        error: apiResponse.error ?? 'Error',
        completedSuccessfully: false
      });
      return;
    }

    this.router.navigate(['/admin/products', apiResponse.response!.id]);

    this.formRequestStatus.set({
      isLoading: false,
      error: '',
      completedSuccessfully: true
    });
    setTimeout(() => {
      this.formRequestStatus.set(INITIAL_FORM_STATUS);
    }, 3000);
  }

  onFilesChange(files: FileList | null) {
    const input: HTMLInputElement = this.imagesInput().nativeElement;
    if (!input || !files) return;

    console.log(files)
    const fileList = Array.from(files ?? []);
    input.value = '';

    this.imageFilesMap.update(current => {
      const map = new Map(current);

      fileList.forEach(file => {
        const imageUrl = URL.createObjectURL(file);
        map.set(imageUrl, file);
      })

      return map;
    })
  }

  onImageDeletion(imageName: string) {
    if (imageName.startsWith('blob:')) {
      this.imageFilesMap.update(current => {
        const map = new Map(current);
        map.delete(imageName);
        return map;
      });
      return;
    }

    const productImages = this.productForm.controls.images.value;

    if (productImages) {
      const newProductImages = productImages.filter(image => image !== imageName);
      this.productForm.controls.images.setValue(newProductImages);
    }
  }
}
