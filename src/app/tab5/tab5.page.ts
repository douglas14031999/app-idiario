import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Device } from '@capacitor/device';
import { StorageService } from '../services/storage.service';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-tab5',
  templateUrl: './tab5.page.html',
  styleUrls: ['./tab5.page.scss'],
  standalone: false,
})
export class Tab5Page implements OnInit {
  app_version!: string;
  public user_email!: string;
  public user_full_name!: string;
  public device!: any;
  public loaded: boolean = false;

  constructor(
    private storage: StorageService,
    private router: Router,
  ) {
    this.storage.get('user').then((user) => {
      this.user_email = user.email;
      this.user_full_name = user.first_name + ' ' + user.last_name;
    });
  }

  async ngOnInit() {
    this.app_version = environment.app.version;
    await Device.getInfo().then((res) => {
      if (res) {
        this.device = res;
        this.loaded = true;
      }
    });
  }

  logout() {
    this.storage.clear().finally(async () => {
      await this.router.navigate(['/sign-in']);
    });
  }
}
