import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { ApiService } from './api';
import { Customer } from '../data/customer.interface';
import { environment } from 'src/environments/environment';

@Injectable()
export class CustomersService {
  constructor(
    private http: HttpClient,
    private api: ApiService,
  ) { }

  getCustomers(): Observable<Customer[]> {
    const configuredCity = {
      name: (environment.app as any).city_name || 'Localhost',
      url: environment.app.cities_url,
      support_url: environment.app.cities_url,
    } as Customer;

    if (!environment.production) {
      return of([configuredCity]);
    }

    return this.http.get<any>(this.api.getAllHostsUrl()).pipe(
      map((response: any) => {
        let customers: Customer[] = [];
        if (response && response.customers) {
          customers = response.customers.map((customer: Customer) => ({
            name: customer.name,
            url: customer.url,
            support_url: customer.support_url,
          }));
        }

        // Add configured city if it's not already in the list
        if (!customers.some(c => c.name === configuredCity.name)) {
          customers.push(configuredCity);
        }

        return customers.sort((a, b) => a.name.localeCompare(b.name));
      }),
      // Fallback to configured city if service is down
      catchError(() => of([configuredCity]))
    );
  }
}
