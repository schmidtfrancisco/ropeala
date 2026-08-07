import { AfterViewInit, Component, ElementRef, input, OnChanges, output, SimpleChanges, viewChild } from '@angular/core';
import { ProductImagePipe } from '@products/pipes/product-image-pipe';
import { ChevronLeft, ChevronRight, LucideAngularModule } from 'lucide-angular';
import Swiper from 'swiper';
import 'swiper/css';
import 'swiper/css/effect-cube';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { EffectCube, EffectCreative, Navigation, Pagination } from 'swiper/modules';


@Component({
  selector: 'product-carousel',
  imports: [ProductImagePipe, LucideAngularModule],
  templateUrl: './product-carousel.html',
  styleUrl: './product-carousel.css'
})
export class ProductCarousel implements AfterViewInit, OnChanges {
  images = input.required<string[]>();
  deleteOption = input<boolean>(false);
  loop = input<boolean>(true);
  deleteImage = output<string>();
  swiper: Swiper | null = null;
  swiperDiv = viewChild.required<ElementRef>('swiperDiv');
  prevButton = viewChild.required<ElementRef>('prevButton');
  nextButton = viewChild.required<ElementRef>('nextButton');
  readonly ChevronLeft = ChevronLeft;
  readonly ChevronRight = ChevronRight;

  ngAfterViewInit(): void {
    this.swiperInit();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['images'].firstChange) return;

    if (!this.swiper) return;

    queueMicrotask(() => {
      this.swiper?.update();
    });
  }

  swiperInit() {
    const element = this.swiperDiv().nativeElement;
    if (!element) return;

    this.swiper = new Swiper(element, {
      // Optional parameters
      direction: 'horizontal',
      loop: this.loop(),
      modules: [EffectCube, Pagination, Navigation],
      effect: 'cube',

      grabCursor: true,      // modules: [Navigation, Pagination],

      // If we need pagination
      pagination: {
        el: '.swiper-pagination',
        clickable: true,
        type: 'bullets'
      },

      // Navigation arrows
      navigation: {
        prevEl: this.prevButton().nativeElement,
        nextEl: this.nextButton().nativeElement,
        hideOnClick: true
      },

    });
  }
}
