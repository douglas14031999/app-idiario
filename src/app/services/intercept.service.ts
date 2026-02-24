import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { MessagesService } from './messages';

@Injectable({
  providedIn: 'root',
})
export class InterceptService implements HttpInterceptor {
  constructor(private messages: MessagesService) { }
  intercept(
    req: HttpRequest<any>,
    next: HttpHandler,
  ): Observable<HttpEvent<any>> {
    // Não adicionar Token em requisições de login ou de busca de municípios
    if (req.url.includes('/usuarios/logar.json') || req.url === environment.app.cities_url) {
      return next.handle(req);
    }

    const accessToken = environment.app.token;
    let handle: Observable<HttpEvent<any>>;
    if (accessToken && accessToken !== 'TOKEN' && accessToken !== 'URL') {
      const authReq = req.clone({
        setHeaders: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      handle = next.handle(authReq);
    } else {
      handle = next.handle(req);
    }

    return handle.pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.message && error.message.includes('Http failure during parsing') && error.message.includes('/usuarios/logar')) {
          const friendlyMessage = 'Sua sessão expirou. Por favor, faça login novamente.';
          return throwError(() => new Error(friendlyMessage));
        }
        return throwError(() => error);
      })
    );
  }
}
