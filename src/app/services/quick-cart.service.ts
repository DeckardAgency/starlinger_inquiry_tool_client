import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class QuickCartService {
  private isOpenSubject = new BehaviorSubject<boolean>(false);
  isOpen$ = this.isOpenSubject.asObservable();

  toggleCart() {
    this.isOpenSubject.next(!this.isOpenSubject.value);
  }

  closeCart() {
    this.isOpenSubject.next(false);
  }
}
