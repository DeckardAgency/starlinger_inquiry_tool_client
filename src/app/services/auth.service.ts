import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { delay, tap } from 'rxjs/operators';

export interface User {
  username: string;
  email: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$: Observable<User | null> = this.currentUserSubject.asObservable();
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(this.hasStoredToken());
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor() {
    // Check if user is already logged in from localStorage
    try {
      const storedUser = this.getItemFromStorage('currentUser');
      if (storedUser) {
        this.currentUserSubject.next(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error('Error loading user from storage:', error);
    }
  }

  login(username: string, password: string): Observable<boolean> {
    // Fake login - in a real app, this would make an HTTP request
    // For this example, we'll accept a specific username/password
      if (username === 'test@starlinger.com' && password === 'Secret007') {
      const user: User = {
        username: 'user',
        email: username
      };

      try {
        // Store token and user info
        this.setItemInStorage('auth_token', 'fake-jwt-token');
        this.setItemInStorage('currentUser', JSON.stringify(user));
      } catch (error) {
        console.warn('Could not save authentication data to storage:', error);
      }

      // Update subjects
      this.currentUserSubject.next(user);
      this.isAuthenticatedSubject.next(true);

      // Simulate network delay
      return of(true).pipe(
        delay(800),
        tap(() => console.log('User logged in successfully'))
      );
    }

    // Login failed
    return of(false).pipe(
      delay(800),
      tap(() => console.log('Login failed'))
    );
  }

  logout(): void {
    try {
      // Clear storage
      this.removeItemFromStorage('auth_token');
      this.removeItemFromStorage('currentUser');
    } catch (error) {
      console.warn('Could not clear authentication data from storage:', error);
    }

    // Update subjects
    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);
  }

  isAuthenticated(): boolean {
    return this.isAuthenticatedSubject.value;
  }

  private hasStoredToken(): boolean {
    try {
      return !!this.getItemFromStorage('auth_token');
    } catch (error) {
      console.warn('Could not check authentication status:', error);
      return false;
    }
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  // Safe storage methods with fallbacks
  private isLocalStorageAvailable(): boolean {
    try {
      const testKey = '__test__';
      localStorage.setItem(testKey, testKey);
      localStorage.removeItem(testKey);
      return true;
    } catch (e) {
      return false;
    }
  }

  private getItemFromStorage(key: string): string | null {
    if (this.isLocalStorageAvailable()) {
      return localStorage.getItem(key);
    }

    // Fallback to memory storage or return null
    return null;
  }

  private setItemInStorage(key: string, value: string): void {
    if (this.isLocalStorageAvailable()) {
      localStorage.setItem(key, value);
    }

    // If localStorage is not available, we could implement an in-memory fallback
    // but for now we'll just log the issue
    // console.log(`Storage unavailable: could not save ${key}`);
  }

  private removeItemFromStorage(key: string): void {
    if (this.isLocalStorageAvailable()) {
      localStorage.removeItem(key);
    }

    // Again, we could implement an in-memory fallback here if needed
  }
}
