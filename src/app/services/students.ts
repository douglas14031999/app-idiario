import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from './api';
import { HttpClient } from '@angular/common/http';
import { StorageService } from './storage.service';

@Injectable()
export class StudentsService {
  constructor(
    private http: HttpClient,
    private storage: StorageService,
    private api: ApiService,
  ) { }

  getStudents(
    classroomId: number,
    disciplineId: number,
    teacherId: number,
  ): Observable<any> {
    const request = this.http.get(this.api.getClassroomStudentsUrl(), {
      params: {
        classroom_id: classroomId,
        discipline_id: disciplineId,
        teacher_id: teacherId,
      },
    });
    return request.pipe(
      map((response: any) => {
        return {
          data: response,
          classroomId: classroomId,
          disciplineId: disciplineId,
        };
      }),
    );
  }

  getOfflineGlobalStudents(classroomId: number): Observable<any> {
    return new Observable((observer) => {
      this.storage.get('students').then((students) => {
        if (!students) {
          observer.next({ data: { classroom_students: [] } });
          observer.complete();
          return;
        }

        const filteredStudents = students.filter(
          (student: { classroomId: number }) => student.classroomId == classroomId
        );

        observer.next({ data: { classroom_students: filteredStudents } });
        observer.complete();
      });
    });
  }

  getOfflineDisciplineStudents(
    classroomId: number,
    disciplineId: number,
  ): Observable<any> {
    return new Observable((observer) => {
      this.storage.get('students').then((students) => {
        if (!students) {
          observer.next({ data: { classroom_students: [] } });
          observer.complete();
          return;
        }

        const filteredStudents = students.filter(
          (student: { classroomId: number; disciplineId: number }) =>
            student.classroomId == classroomId &&
            student.disciplineId == disciplineId
        );

        observer.next({ data: { classroom_students: filteredStudents } });
        observer.complete();
      });
    });
  }
}
