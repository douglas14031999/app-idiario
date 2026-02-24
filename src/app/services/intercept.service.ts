import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpHeaders,
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class InterceptService implements HttpInterceptor {
  constructor() { }
  intercept(
    req: HttpRequest<any>,
    next: HttpHandler,
  ): Observable<HttpEvent<any>> {
    // Não adicionar Token em requisições de login ou de busca de municípios
    if (req.url.includes('/usuarios/logar.json') || req.url === environment.app.cities_url) {
      return next.handle(req);
    }

    const accessToken = environment.app.token;

    const authReq = req.clone({
      headers: new HttpHeaders({
        Authorization: `Bearer ${accessToken}`,
      }),
    });

    return next.handle(authReq);
  }
}
