import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { ContentRecordsService } from '../services/content_records';
import { StorageService } from '../services/storage.service';
import { UtilsService } from '../services/utils';

@Component({
  selector: 'app-content-record-form',
  templateUrl: './content-record-form.page.html',
  styleUrls: ['./content-record-form.page.scss'],
  standalone: false,
})
export class ContentRecordFormPage implements OnInit {
  recordDate!: string;
  unityId!: number;
  disciplineId!: number;
  classroomId!: number;
  gradeId!: number;
  displayDate!: string;
  description!: string;
  unityName!: string;
  classroomName!: string;
  callback: any;
  newContent = '';
  baseContents: any = {};
  contentRecord: any = {};
  contents: any[] = [];

  constructor(
    private storage: StorageService,
    private utilsService: UtilsService,
    private contentRecordService: ContentRecordsService,
    private route: ActivatedRoute,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      this.baseContents = {};
      this.contentRecord = {};
      this.contents = [];
      this.recordDate = params['date'];
      const date = this.utilsService.getDate(this.recordDate);
      date.setHours(24, 0, 0, 0);
      this.displayDate = this.utilsService.toExtensiveFormat(date);
      this.unityId = params['unityId'];
      this.disciplineId = params['disciplineId'];
      this.classroomId = params['classroomId'];
      this.gradeId = params['gradeId'];
      this.description = params['description'];
      this.callback = params['callback'];
      this.classroomName = params['classroomName'];
      this.unityName = params['unityName'];

      forkJoin({
        contentLessonPlans: this.storage.get('contentLessonPlans'),
        contentRecords: this.storage.get('contentRecords'),
        teachingPlans: this.storage.get('teachingPlans'),
      }).subscribe((results) => {
        const contentLessonPlans = results.contentLessonPlans || [];
        const contentRecords = results.contentRecords || [];
        const teachingPlans = results.teachingPlans || [];

        this.baseContents = this.getContentLessonPlan(contentLessonPlans);

        if (!this.baseContents) {
          this.baseContents = this.getTeachingPlan(teachingPlans);
        }

        this.contentRecord = this.getContentRecord(contentRecords);

        if (!this.contentRecord) {
          this.contentRecord = {
            id: undefined,
            record_date: this.recordDate,
            classroom_id: this.classroomId,
            classroom_name: this.classroomName,
            description: this.description,
            discipline_id: this.disciplineId,
            grade_id: this.gradeId,
            unity_id: this.unityId,
            unity_name: this.unityName,
            contents: [],
          };
        }

        this.loadContents();
      });
    });
  }

  async ionViewWillLeave() {
    const oldContents = this.contentRecord['contents']
      .map((x: any) => x.description.trim())
      .sort();
    const currentContents = this.contents
      .filter((x: any) => x.checked)
      .map((x: any) => x.description.trim())
      .sort();

    if (JSON.stringify(oldContents) !== JSON.stringify(currentContents)) {
      this.contentRecord['contents'] = this.contents.filter(
        (x: any) => x.checked,
      );
      this.contentRecordService
        .createOrUpdate(this.contentRecord)
        .subscribe(() => {
          if (typeof this.callback === 'function') {
            this.callback();
          }
        });
    }
  }

  loadContents() {
    const baseContents = this.baseContents?.contents || [];
    const contentRecord = this.contentRecord?.contents || [];

    this.contents = baseContents
      .concat(contentRecord)
      .filter(
        (c1: any, i: number, self: any[]) =>
          self.findIndex((c2) => c2.description === c1.description) === i,
      );
    (this.contentRecord['contents'] || []).forEach((content: any) => {
      const index = this.contents
        .map((c: any) => c.description)
        .indexOf(content.description);
      if (index >= 0) {
        this.contents[index].checked = true;
      }
    });
  }

  addContent() {
    const indexFound = this.contents.findIndex((c) =>
      this.utilsService.compareStrings(c.description, this.newContent),
    );

    if (indexFound >= 0) {
      this.contents[indexFound].checked = true;
    } else {
      this.contents.push({
        id: undefined,
        description: this.newContent,
        checked: true,
      });
    }
    this.newContent = '';

    return false;
  }

  getContentLessonPlan(contentLessonPlans: any[]) {
    return contentLessonPlans
      .flatMap((p) => p.lesson_plans)
      .find((plan) => {
        if (
          plan.grade_id == this.gradeId &&
          plan.classroom_id == this.classroomId &&
          plan.discipline_id == this.disciplineId &&
          plan.unity_id == this.unityId &&
          plan.start_at <= this.recordDate &&
          plan.end_at >= this.recordDate
        ) {
          return plan;
        }
      });
  }

  getContentRecord(contentRecords: any[]) {
    return contentRecords.find((contentRecord) => {
      if (
        contentRecord.grade_id == this.gradeId &&
        contentRecord.classroom_id == this.classroomId &&
        contentRecord.discipline_id == this.disciplineId &&
        contentRecord.unity_id == this.unityId &&
        contentRecord.record_date == this.recordDate
      ) {
        return contentRecord;
      }
    });
  }

  getTeachingPlan(teachingPlanUnities: any) {
    return teachingPlanUnities
      .flatMap((t: any) => t.unities)
      .filter((x: any) => x.unity_id == this.unityId)
      .flatMap((x: any) => x.plans)
      .find((teachingPlan: any) => {
        if (
          teachingPlan.grade_id == this.gradeId &&
          teachingPlan.discipline_id == this.disciplineId
        ) {
          return teachingPlan;
        }
      });
  }

  goBack() {
    // Garante que o localstore é atualizado para que os conteúdos sejam
    // exibidos corretamente na tela de listagem.
    forkJoin({
      contentRecords: this.storage.get('contentRecords'),
    }).subscribe(async (results) => {
      await this.contentRecordService.updateContentRecords(
        this.contentRecordService.addOrReplaceContentRecord(
          results.contentRecords,
          this.contentRecord,
        ),
      );

      await this.router.navigate(['/tabs/tab2']);
    });
  }
}
