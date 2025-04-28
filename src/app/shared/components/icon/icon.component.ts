import { Component, Input, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-icon',
  standalone: true,
  imports: [CommonModule],
  template: `<span class="icon" [ngClass]="iconClass" [innerHTML]="svgIcon"></span>`,
  styles: [`
    .icon {
      display: flex;
      align-items: center;
      justify-content: center;
    }
    svg {
      width: 100%;
      height: 100%;
    }
  `]
})
export class IconComponent implements OnChanges {
  @Input() name!: string;
  @Input() size: string = '24px';
  @Input() color: string = 'currentColor';

  svgIcon: SafeHtml | null = null;
  iconClass: string = '';

  constructor(private sanitizer: DomSanitizer) {}

  ngOnChanges(): void {
    this.updateIcon();
  }

  private updateIcon(): void {
    const icon = ICONS[this.name];
    if (icon) {
      this.iconClass = `icon-${this.name}`;

      // Add size and color styles to SVG markup
      const svg = icon.replace('<svg', `<svg style="width:${this.size};height:${this.size};color:${this.color}"`);

      this.svgIcon = this.sanitizer.bypassSecurityTrustHtml(svg);
    } else {
      console.warn(`Icon "${this.name}" not found`);
      this.svgIcon = null;
    }
  }
}

// Icon registry
const ICONS: {[key: string]: string} = {
  cart: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="9" cy="21" r="1"></circle>
    <circle cx="20" cy="21" r="1"></circle>
    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
  </svg>`,

  heart: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
  </svg>`,

  search: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="11" cy="11" r="8"></circle>
    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
  </svg>`,

  grid: `<svg fill="none" xmlns="http://www.w3.org/2000/svg"><path
                d="M6 2H2.667A.667.667 0 0 0 2 2.667V6c0 .368.298.667.667.667H6A.667.667 0 0 0 6.667 6V2.667A.667.667 0 0 0 6 2ZM13.333 2H10a.667.667 0 0 0-.667.667V6c0 .368.299.667.667.667h3.333A.667.667 0 0 0 14 6V2.667A.667.667 0 0 0 13.333 2ZM13.333 9.333H10a.667.667 0 0 0-.667.667v3.333c0 .368.299.667.667.667h3.333a.667.667 0 0 0 .667-.667V10a.667.667 0 0 0-.667-.667ZM6 9.333H2.667A.667.667 0 0 0 2 10v3.333c0 .368.298.667.667.667H6a.667.667 0 0 0 .667-.667V10A.667.667 0 0 0 6 9.333Z"
                stroke="currentColor" stroke-width="1.33" stroke-linecap="round" stroke-linejoin="round"/></svg>`,

  list: `<svg fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M9.333 2.667H14M9.333 6H14m-4.667 4H14m-4.667 3.333H14M2.667 2H6c.368 0 .667.298.667.667V6A.667.667 0 0 1 6 6.667H2.667A.667.667 0 0 1 2 6V2.667C2 2.298 2.298 2 2.667 2Zm0 7.333H6c.368 0 .667.299.667.667v3.333A.667.667 0 0 1 6 14H2.667A.667.667 0 0 1 2 13.333V10c0-.368.298-.667.667-.667Z" stroke="currentColor" stroke-width="1.33" stroke-linecap="round" stroke-linejoin="round"/></svg>`,

  magnifier: `<svg fill="none" xmlns="http://www.w3.org/2000/svg"><path d="m14 14-2.867-2.867m1.534-3.8A5.333 5.333 0 1 1 2 7.333a5.333 5.333 0 0 1 10.667 0Z" stroke="currentColor" stroke-width="1.33" stroke-linecap="round" stroke-linejoin="round"/></svg>`,

  filter: `<svg fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M2.5 4h12M5.167 8h6.666m-4.666 4h2.666"
                  stroke="currentColor"
                  stroke-width="1.33"
                  stroke-linecap="round"
                  stroke-linejoin="round"/>
          </svg>`,

  arrowDown: `<svg fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="m4 6 4 4 4-4" stroke="currentColor" stroke-width="1.33" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>`,

  close: `<svg viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 3L3 9M3 3L9 9" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>`,

  packageSearch: `<svg fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M21 10V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l2-1.14M7.5 4.27l9 5.15M3.29 7 12 12m0 0 8.71-5M12 12v10m8.27-4.73L22 19m-1-3.5a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,

  carouselArowLeft: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="none">
  <path d="M7.99998 12.6666L3.33331 7.99992M3.33331 7.99992L7.99998 3.33325M3.33331 7.99992H12.6666" stroke="currentColor" stroke-width="1.33" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`,

  carouselArowRight: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="none">
  <path d="M3.33337 7.99992H12.6667M12.6667 7.99992L8.00004 3.33325M12.6667 7.99992L8.00004 12.6666" stroke="currentColor" stroke-width="1.33" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`,

  // Add more icons as needed
};
