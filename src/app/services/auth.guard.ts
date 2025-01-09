import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from './auth';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(
    private auth: AuthService,
    private router: Router,
  ) {}

  async canActivate(): Promise<boolean> {
    const isAuthenticated = await this.auth.isSignedIn();

    if (isAuthenticated) {
      return true;
    }

    await this.router.navigate(['/sign-in']);

    return false;
  }
}
