import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CarouselComponent, CarouselImage } from './carousel.component';

describe('CarouselComponent', () => {
  let component: CarouselComponent;
  let fixture: ComponentFixture<CarouselComponent>;
  let compiled: HTMLElement;

  const mockImages: CarouselImage[] = [
    { url: 'image1.jpg', alt: 'Image 1', caption: 'First Image' },
    { url: 'image2.jpg', alt: 'Image 2', caption: 'Second Image' },
    { url: 'image3.jpg', alt: 'Image 3', caption: 'Third Image' }
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CarouselComponent ]
    })
      .compileComponents();

    fixture = TestBed.createComponent(CarouselComponent);
    component = fixture.componentInstance;
    compiled = fixture.nativeElement;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display images', () => {
    component.images = mockImages;
    fixture.detectChanges();

    const slides = compiled.querySelectorAll('.carousel-slide');
    expect(slides.length).toBe(3);
  });

  it('should show navigation arrows when showArrows is true', () => {
    component.images = mockImages;
    component.showArrows = true;
    fixture.detectChanges();

    const arrows = compiled.querySelectorAll('.carousel-arrow');
    expect(arrows.length).toBe(2);
  });

  it('should hide navigation arrows when showArrows is false', () => {
    component.images = mockImages;
    component.showArrows = false;
    fixture.detectChanges();

    const arrows = compiled.querySelectorAll('.carousel-arrow');
    expect(arrows.length).toBe(0);
  });

  it('should show dots when showDots is true', () => {
    component.images = mockImages;
    component.showDots = true;
    fixture.detectChanges();

    const dots = compiled.querySelectorAll('.carousel-dot');
    expect(dots.length).toBe(3);
  });

  it('should navigate to next slide', () => {
    component.images = mockImages;
    fixture.detectChanges();

    expect(component.currentIndex).toBe(0);
    component.next();
    expect(component.currentIndex).toBe(1);
  });

  it('should navigate to previous slide', () => {
    component.images = mockImages;
    component.currentIndex = 1;
    fixture.detectChanges();

    component.previous();
    expect(component.currentIndex).toBe(0);
  });

  it('should handle infinite loop', () => {
    component.images = mockImages;
    component.infiniteLoop = true;
    component.currentIndex = 2;
    fixture.detectChanges();

    component.next();
    expect(component.currentIndex).toBe(0);
  });

  it('should not loop when infiniteLoop is false', () => {
    component.images = mockImages;
    component.infiniteLoop = false;
    component.currentIndex = 2;
    fixture.detectChanges();

    component.next();
    expect(component.currentIndex).toBe(2);
  });

  it('should start autoplay when enabled', () => {
    jasmine.clock().install();
    component.images = mockImages;
    component.autoPlay = true;
    component.autoPlayInterval = 1000;

    component.ngOnInit();
    expect(component.currentIndex).toBe(0);

    jasmine.clock().tick(1000);
    expect(component.currentIndex).toBe(1);

    jasmine.clock().uninstall();
  });

  it('should handle touch events', () => {
    component.images = mockImages;
    fixture.detectChanges();

    const touchStartEvent = new TouchEvent('touchstart', {
      touches: [{ clientX: 100 } as Touch]
    });

    component.onTouchStart(touchStartEvent);
    expect(component.isDragging).toBe(true);
  });

  afterEach(() => {
    component.ngOnDestroy();
  });
});
