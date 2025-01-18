import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiService } from './api';

@Injectable()
export class ContentLessonPlansService {
  constructor(
    private http: HttpClient,
    private api: ApiService,
  ) {}

  getContentLessonPlans(teacherId: number) {
    return this.http.get(this.api.getContentLessonPlansUrl(), {
      params: { teacher_id: teacherId },
    });
  }
}
