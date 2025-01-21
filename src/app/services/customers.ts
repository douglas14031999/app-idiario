import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from './api';
import { Customer } from '../data/customer.interface';
import { environment } from 'src/environments/environment';

@Injectable()
export class CustomersService {
  constructor(
    private http: HttpClient,
    private api: ApiService,
  ) {}

  getCustomers(): Observable<Customer[]> {
    if (!environment.production) {
      const all = {
        name: 'Localhost',
        url: environment.app.cities_url,
        support_url: environment.app.cities_url,
      } as Customer;

      return of([all]).pipe();
    }

    return this.http.get<any[]>(this.api.getAllHostsUrl()).pipe(
      map((response: any) => {
        if (response && response.customers) {
          return response.customers
            .map((customer: Customer) => {
              return {
                name: customer.name,
                url: customer.url,
                support_url: customer.support_url,
              };
            })
            .sort((a: Customer, b: Customer) => a.name.localeCompare(b.name));
        } else {
          return [];
        }
      }),
    );
  }
}
