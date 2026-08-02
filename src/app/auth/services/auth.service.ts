import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { AuthResponse } from '@auth/interfaces/auth-response.interface';
import { NewUser, User } from '@auth/interfaces/user.interface';
import { catchError, map, Observable, of, tap, timestamp } from 'rxjs';
import { environment } from '../../../environments/environment';
import { rxResource } from '@angular/core/rxjs-interop';

type AuthStatus = 'checking' | 'authenticated' | 'not-authenticated';
const BASE_URL = environment.apiBaseUrl;
const AUTH_STATUS_CACHE_TIME = 10 * 60 * 1000;

interface AuthStatusCacheEntry {
  response: AuthResponse,
  timestamp: number,
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private _authStatus = signal<AuthStatus>('checking');
  private _user = signal<User | null>(null);
  private _token = signal<string | null>(localStorage.getItem('token'));
  private http = inject(HttpClient);
  private authStatusCache = new Map<string,AuthStatusCacheEntry>();

  checkStatusResource = rxResource({
    stream: () => this.checkStatus()
  });

  authStatus = computed<AuthStatus>(() => {
    if (this._authStatus() === 'checking') return 'checking';

    if (this._user()) return 'authenticated';

    return 'not-authenticated';
  })

  user = computed(() => this._user());
  token = computed(() => this._token());

  login(email: string, password: string): Observable<boolean> {
    return this.http.post<AuthResponse>(`${BASE_URL}/auth/login`, {
      email: email,
      password: password
    })
    .pipe(
      tap(resp => this.saveInCache(resp)),
      map(resp => this.handleAuthSuccess(resp)),
      catchError(error => this.handleAuthError(error))
    )
  }

  checkStatus(): Observable<boolean> {
    const token = localStorage.getItem('token');
    if (!token) {
      this.logout();
      return of(false);
    }

    const cached = this.authStatusCache.get(token);
    if (cached && this.isCacheEntryValid(cached)) {
      return of(this.handleAuthSuccess(cached.response));
    }
    
    return this.http.get<AuthResponse>(`${BASE_URL}/auth/check-status`)
    .pipe(
      tap(resp => this.saveInCache(resp)),
      map(resp => this.handleAuthSuccess(resp)),
      catchError(error => this.handleAuthError(error))
    )
  }

  register(newUser: NewUser): Observable<boolean> {
    const { email, password, fullName } = newUser;
    return this.http.post<AuthResponse>(`${BASE_URL}/auth/register`, {
      email: email,
      password: password,
      fullName: fullName,
    })
    .pipe(
      tap(resp => this.saveInCache(resp)),
      map(resp => this.handleAuthSuccess(resp)),
      catchError(error => this.handleAuthError(error))
    )
  }

  logout() {
    this._user.set(null);
    this._token.set(null);
    this._authStatus.set('not-authenticated');

    localStorage.removeItem('token');
  }

  private handleAuthSuccess(response: AuthResponse) {
    const { token, user } = response;
    this._user.set(user);
    this._authStatus.set('authenticated');
    this._token.set(token);
   
    localStorage.setItem('token', token);
    return true;
  }

  private handleAuthError(error: any) {
    this.logout();
    return of(false);
  }

  private saveInCache(response: AuthResponse) {
    const { token } = response;
    
    const cacheEntry: AuthStatusCacheEntry = { 
      response: response,
      timestamp: Date.now()
    }

    this.authStatusCache.set(token, cacheEntry);
  }
 
  private isCacheEntryValid(entry: AuthStatusCacheEntry) {
    return Date.now() - entry.timestamp < AUTH_STATUS_CACHE_TIME;
  }

}