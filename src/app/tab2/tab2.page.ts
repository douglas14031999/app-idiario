import { Component } from '@angular/core';
import { MessagesService } from '../services/messages';
import { SyncProvider } from '../services/sync';
import { UtilsService } from '../services/utils';
import { forkJoin } from 'rxjs';
import { StorageService } from '../services/storage.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
  standalone: false,
})
export class Tab2Page {
  contentDays: any[] = [];
  unities: any[] = [];
  lessonPlans: any[] = [];
  contentRecords: any[] = [];
  teachingPlans: { unities: any[] } = { unities: [] };
  classrooms: any[] = [];
  currentDate: Date = new Date();

  constructor(
    private sync: SyncProvider,
    private storage: StorageService,
    private utilsService: UtilsService,
    private messages: MessagesService,
    private router: Router,
    private route: ActivatedRoute,
  ) {}

  async ngOnInit() {
    await this.sync.isSyncDelayed();

    this.route.params.subscribe(() => {
      this.loadContentDays();
    });
  }

  refreshPage() {
    this.loadContentDays();
  }

  loadContentDays() {
    forkJoin([
      this.storage.get('contentLessonPlans'),
      this.storage.get('contentRecords'),
      this.storage.get('teachingPlans'),
      this.storage.get('classrooms'),
    ]).subscribe((results) => {
      this.lessonPlans = results[0] || [];
      this.contentRecords = results[1] || [];
      this.teachingPlans = results[2] || { unities: [] };
      this.classrooms = results[3] || [];

      const numberOfDays = 7;

      for (let i = numberOfDays; i > 0; i--) {
        let unities: any[] = [];
        let currentDate = this.currentDate;
        currentDate.setHours(0, 0, 0, 0);

        this.contentRecords.forEach((contentRecord) => {
          let contentDate = this.utilsService.getDate(
            contentRecord.record_date,
          );
          contentDate.setHours(24, 0, 0, 0);

          if (currentDate.getTime() !== contentDate.getTime()) {
            return;
          }

          let unityIndex = unities
            .map((d) => d['id'])
            .indexOf(Number(contentRecord.unity_id));

          if (unityIndex < 0) {
            unities.push({
              id: contentRecord.unity_id,
              name: contentRecord.unity_name,
              filledRecords: 0,
              totalRecords: 0,
              unityItems: [],
            });
            unityIndex = unities.length - 1;
          }

          unities[unityIndex].filledRecords++;
          unities[unityIndex].totalRecords++;
          unities[unityIndex].unityItems.push({
            discipline_id: contentRecord.discipline_id,
            classroom_id: contentRecord.classroom_id,
            grade_id: contentRecord.grade_id,
            description: contentRecord.description,
            classroom_name: contentRecord.classroom_name,
            contents: contentRecord.contents,
            plannedContents: [],
            type: 'contentRecord',
          });
        });

        this.processLessonPlans(unities, currentDate);
        this.processTeachingPlans(unities, currentDate);
        this.calculateUniqueContents(unities);

        if (unities.length) {
          this.contentDays.push({
            unities: unities,
            date: this.utilsService.toStringWithoutTime(currentDate),
            format_date: this.utilsService.toExtensiveFormat(currentDate),
          });
        }

        this.currentDate.setDate(currentDate.getDate() - 1);
      }
    });
  }

  processLessonPlans(unities: any[], currentDate: Date) {
    (this.lessonPlans || []).forEach((lessonPlan) => {
      const startAt = this.utilsService.getDate(lessonPlan.start_at);
      const endAt = this.utilsService.getDate(lessonPlan.end_at);
      startAt.setHours(24, 0, 0, 0);
      endAt.setHours(24, 0, 0, 0);

      if (currentDate >= startAt && currentDate <= endAt) {
        const unityIndex = unities
          .map((d) => d['id'])
          .indexOf(lessonPlan.unity_id);
        if (unityIndex >= 0) {
          const description =
            lessonPlan.description + ' - ' + lessonPlan.classroom_name;
          const unityItemIndex = unities[unityIndex].unityItems
            .map(
              (d: { description: string; classroom_name: string }) =>
                d.description + ' - ' + d.classroom_name,
            )
            .indexOf(description);
          if (unityItemIndex >= 0) {
            unities[unityIndex].unityItems[unityItemIndex].plannedContents =
              unities[unityIndex].unityItems[
                unityItemIndex
              ].plannedContents.concat(lessonPlan.contents);
          }
        }
      }
    });
  }

  processTeachingPlans(unities: any[], currentDate: Date) {
    (this.teachingPlans.unities || []).forEach((teachingPlanUnity) => {
      const unityIndex = unities
        .map((d) => parseInt(d['id']))
        .indexOf(parseInt(teachingPlanUnity.unity_id));
      teachingPlanUnity.plans.forEach(
        (teachingPlan: {
          grade_id: number;
          description: string;
          contents: any;
        }) => {
          if (unityIndex >= 0) {
            this.getClassroomsByGradeAndUnity(
              this.classrooms,
              teachingPlanUnity.unity_id,
              teachingPlan.grade_id,
            ).forEach((classroom) => {
              const description =
                teachingPlan.description + ' - ' + classroom.description;
              const unityItemIndex = unities[unityIndex].unityItems
                .map(
                  (d: { description: string; classroom_name: string }) =>
                    d.description + ' - ' + d.classroom_name,
                )
                .indexOf(description);
              if (unityItemIndex >= 0) {
                if (
                  !unities[unityIndex].unityItems[unityItemIndex]
                    .plannedContents ||
                  !unities[unityIndex].unityItems[unityItemIndex]
                    .plannedContents.length
                ) {
                  unities[unityIndex].unityItems[
                    unityItemIndex
                  ].plannedContents = unities[unityIndex].unityItems[
                    unityItemIndex
                  ].plannedContents.concat(teachingPlan.contents);
                }
              }
            });
          }
        },
      );
    });
  }

  calculateUniqueContents(unities: any[]) {
    unities.forEach((unity, unityIndex) => {
      unities[unityIndex].situation_percentage = (
        unity.filledRecords / unity.totalRecords || 0
      ).toLocaleString();
      unity.unityItems.forEach(
        (
          unityItem: { contents: any[]; plannedContents: any },
          unityItemIndex: string | number,
        ) => {
          const uniqueContents = unityItem.contents
            .concat(unityItem.plannedContents)
            .map(
              (d: { id: string; description: string }) =>
                d.id + '-' + d.description,
            )
            .filter((v: any, i: any, a: string | any[]) => a.indexOf(v) === i);
          unities[unityIndex].unityItems[unityItemIndex].uniqueContents =
            uniqueContents;
        },
      );
    });
  }

  getClassroomsByGradeAndUnity(
    classrooms: any[],
    unityId: number,
    gradeId: number,
  ) {
    let filteredClassrooms: any[] = [];
    classrooms
      .filter((cu) => cu.unityId === unityId)
      .forEach((classroomUnity) => {
        classroomUnity.data.forEach((classroom: { grade_id: number }) => {
          if (classroom.grade_id === gradeId) {
            filteredClassrooms.push(classroom);
          }
        });
      });
    return filteredClassrooms;
  }

  newContentRecordForm(contentDate?: string, unityId?: number) {
    this.utilsService.hasAvailableStorage().then((available: boolean) => {
      if (!available) {
        this.messages.showError(
          this.messages.insuficientStorageErrorMessage(
            'lançar novos registros de conteúdo',
          ),
        );
        return;
      }
      this.storage.get('unities').then((unities: any[]) => {
        const navigationExtras = {
          queryParams: {
            unityId: unityId,
            date: contentDate,
          },
          state: {
            unities: unities,
          },
        };

        this.router.navigate(['/new-content-record-form'], navigationExtras);
      });
    });
  }

  openContentRecordForm(
    date: string,
    unityId: number,
    disciplineId: number,
    classroomId: number,
    gradeId: number,
    description: string,
    classroomName: string,
    unityName: string,
  ) {
    const navigationExtras = {
      queryParams: {
        date: date,
        unityId: unityId,
        disciplineId: disciplineId,
        classroomId: classroomId,
        gradeId: gradeId,
        description: description,
        classroomName: classroomName,
        unityName: unityName,
      },
    };

    this.router.navigate(['/content-record-form'], navigationExtras);
  }

  doRefresh() {
    this.sync.execute().subscribe({
      next: () => this.loadContentDays(),
    });
  }
}
