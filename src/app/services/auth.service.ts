import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class AuthService {
  constructor(private http: HttpClient, private router: Router) {}

  register(data: {email:string; password:string; firstName:string; lastName:string; username?:string}) {
    return this.http.post<{token:string}>(`/api/auth/register`, data).pipe(
      tap(res => { localStorage.setItem('token', res.token); this.router.navigateByUrl('/'); })
    );
  }

  login(email: string, password: string) {
    return this.http.post<{token:string}>(`/api/auth/login`, { email, password }).pipe(
      tap(res => { localStorage.setItem('token', res.token); this.router.navigateByUrl('/'); })
    );
  }

  logout(){ localStorage.removeItem('token'); this.router.navigateByUrl('/login'); }
  get token(){ return localStorage.getItem('token'); }
  isLoggedIn(){ return !!this.token; }
}
