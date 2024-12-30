import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api';

@Injectable()
export class UnitiesService {
  constructor(
    private http: HttpClient,
    private api: ApiService,
  ) {}

  getOnlineUnities(teacherId: number): Observable<any> {
    return this.http.get(this.api.getTeacherUnitiesUrl(), {
      params: { teacher_id: teacherId },
    });
  }
}
