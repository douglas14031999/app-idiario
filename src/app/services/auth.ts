import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, from, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { ApiService } from './api';
import { StorageService } from './storage.service';
import { User } from '../data/user.interface';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(
    private http: HttpClient,
    private storage: StorageService,
    private api: ApiService,
  ) {}

  signIn(credential: any, password: any): Observable<any> {
    return this.http
      .post(this.api.getLoginUrl(), {
        user: { credentials: credential, password: password },
      })
      .pipe(
        map((response) => response),
        catchError((error) => {
          return of(null); // Retorna um Observable de null em caso de erro
        }),
      );
  }

  async isSignedIn(): Promise<boolean> {
    const token = await this.storage.get('user');

    return !!token;
  }

  currentUser(): Observable<User> {
    return from(this.storage.get('user')).pipe(
      catchError((error) => {
        throw 'Erro ao obter o usuário'; // Lança um erro se não puder obter o usuário
      }),
    );
  }

  setCurrentUser(user: User): Observable<void> {
    return from(this.storage.set('user', user)).pipe(
      catchError((error) => {
        throw 'Erro ao definir o usuário'; // Lança um erro se não puder definir o usuário
      }),
    );
  }

  removeCurrentUser(): Observable<void> {
    return from(this.storage.remove('user')).pipe(
      catchError((error) => {
        throw 'Erro ao remover o usuário'; // Lança um erro se não puder remover o usuário
      }),
    );
  }
}
