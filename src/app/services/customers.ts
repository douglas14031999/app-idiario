import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from './api';
import { Customer } from '../data/customer.interface';

@Injectable()
export class CustomersService {
  constructor(
    private http: HttpClient,
    private api: ApiService,
  ) {}

  getCustomers(): Observable<Customer[]> {
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
