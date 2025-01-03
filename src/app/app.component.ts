import { Component } from '@angular/core';
import { Platform } from '@ionic/angular';
import { StorageService } from './services/storage.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: false,
})
export class AppComponent {
  constructor(
    private storage: StorageService,
    private platform: Platform,
  ) {}

  async ngOnInit() {
    this.platform.ready().then(async () => {
      await this.storage.init();
    });
  }
}
