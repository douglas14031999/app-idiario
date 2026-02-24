import { Injectable } from '@angular/core';
import { StorageService } from './storage.service';
import { environment } from 'src/environments/environment';

@Injectable()
export class ApiService {
  serverUrl: string = '';
  private serverUrlPromise: Promise<string>;

  constructor(private storage: StorageService) {
    this.serverUrlPromise = this.storage.get('serverUrl').then((serverUrl) => {
      this.serverUrl = serverUrl || '';
      return this.serverUrl;
    });
  }

  async setServerUrl(serverUrl: string) {
    if (serverUrl && serverUrl.endsWith('/')) {
      serverUrl = serverUrl.slice(0, -1);
    }
    await this.storage.set('serverUrl', serverUrl);
    this.serverUrl = serverUrl;
    this.serverUrlPromise = Promise.resolve(serverUrl);
  }

  private cleanUrl(url: string): string {
    if (url && url.endsWith('/')) {
      return url.slice(0, -1);
    }
    return url;
  }

  getTeacherClassroomsUrl() {
    return this.cleanUrl(this.serverUrl) + '/api/v2/teacher_classrooms.json';
  }

  getLoginUrl() {
    return this.cleanUrl(this.serverUrl) + '/usuarios/logar.json';
  }

  getDailyFrequencyStudentsUrl(id: number) {
    return this.cleanUrl(this.serverUrl) + '/api/v2/daily_frequency_students/' + id + '.json';
  }

  getDailyFrequencyUrl() {
    return this.cleanUrl(this.serverUrl) + '/api/v2/diario-de-frequencia.json';
  }

  getTeacherDisciplinesUrl() {
    return this.cleanUrl(this.serverUrl) + '/api/v2/teacher_disciplines.json';
  }

  getExamRulesUrl() {
    return this.cleanUrl(this.serverUrl) + '/api/v2/exam_rules.json';
  }

  getSchoolCalendarUrl() {
    return this.cleanUrl(this.serverUrl) + '/api/v2/calendarios-letivo.json';
  }

  getClassroomStudentsUrl() {
    return this.cleanUrl(this.serverUrl) + '/api/v2/classroom_students.json';
  }

  getTeacherUnitiesUrl() {
    return this.cleanUrl(this.serverUrl) + '/api/v2/teacher_unities.json';
  }

  getTeacherLessonPlansUrl() {
    return this.cleanUrl(this.serverUrl) + '/api/v2/lesson_plans.json';
  }

  getContentLessonPlansUrl() {
    return this.cleanUrl(this.serverUrl) + '/api/v2/content_records/lesson_plans.json';
  }

  getContentRecordsUrl() {
    return this.cleanUrl(this.serverUrl) + '/api/v2/content_records.json';
  }

  getTeacherTeachingPlansUrl() {
    return this.cleanUrl(this.serverUrl) + '/api/v2/teaching_plans.json';
  }

  getDailyFrequencyStudentsUpdateOrCreateUrl() {
    return (
      this.cleanUrl(this.serverUrl) + '/api/v2/daily_frequency_students/update_or_create.json'
    );
  }

  getContentRecordsSyncUrl() {
    return this.cleanUrl(this.serverUrl) + '/api/v2/content_records/sync.json';
  }

  getAllHostsUrl() {
    return this.cleanUrl(environment.app.cities_url);
  }
}
