import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { StorageService } from '../storage.service';
import { UnitiesService } from '../unities';
import { User } from '../../data/user.interface';
import { Unity } from '../../data/unity.interface';

@Injectable()
export class UnitiesPersisterService {
  constructor(
    private unities: UnitiesService,
    private storage: StorageService,
  ) {}

  persist(user: User): Observable<any> {
    const unities = this.unities.getOnlineUnities(user.teacher_id);

    const setUnitiesInStorage = tap((unities: Unity[]) =>
      this.storage.set('unities', unities),
    );

    return unities.pipe(setUnitiesInStorage);
  }
}
