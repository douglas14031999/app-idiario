import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { LoadingController } from '@ionic/angular';
import { Customer } from '../data/customer.interface';
import { User } from '../data/user.interface';
import { ApiService } from '../services/api';
import { AuthService } from '../services/auth';
import { ConnectionService } from '../services/connection';
import { CustomersService } from '../services/customers';
import { MessagesService } from '../services/messages';
import { UtilsService } from '../services/utils';

@Component({
  selector: 'app-sign-in',
  templateUrl: './sign-in.page.html',
  styleUrls: ['./sign-in.page.scss'],
  standalone: false,
})
export class SignInPage implements OnInit {
  cities: Customer[] = [];
  anyError: boolean = false;
  errorMessage: string = '';
  selectedCity: Customer | undefined;
  isOnline: boolean = true;
  supportUrl: string = '';
  credentials: string = '';
  password: string = '';

  constructor(
    private auth: AuthService,
    private loadingCtrl: LoadingController,
    private connection: ConnectionService,
    private customersService: CustomersService,
    private api: ApiService,
    private utilsService: UtilsService,
    private messages: MessagesService,
    private cdr: ChangeDetectorRef,
    private router: Router,
  ) {}

  async ngOnInit(): Promise<void> {
    this.isOnline = this.connection.isOnline;
    this.connection.eventOnline.subscribe((online: boolean) => {
      this.changeInputMunicipios(online);
    });
  }

  async changeInputMunicipios(online: boolean) {
    this.isOnline = online;

    if (this.isOnline) {
      this.getCustomers();
    } else {
      this.selectedCity = undefined;
      await this.messages.showToast('Sem conexão!', 1000, 'top');
    }
  }

  updateSupportUrl() {
    if (this.selectedCity != undefined) {
      this.api.setServerUrl(this.selectedCity.url);
    }

    const defaultSupport = 'https://portabilis.freshdesk.com/';

    this.supportUrl = this.selectedCity
      ? this.selectedCity.support_url || defaultSupport
      : '';
  }

  getCustomers() {
    this.customersService.getCustomers().subscribe((data: Customer[]) => {
      this.cities = data;
      this.cdr.detectChanges();
    });
  }

  async loginForm(form: NgForm) {
    const credential = this.credentials;
    const password = this.password;
    const loading = await this.loadingCtrl.create({
      message: 'Carregando ...',
      duration: 3000,
    });

    await loading.present();

    this.auth.signIn(credential, password).subscribe({
      next: (user: User) => {
        if (user) {
          this.auth.setCurrentUser(user).subscribe({
            next: () => {
              this.router.navigate(['/tabs/tab1']);
            },
          });
        } else {
          this.anyError = true;
          this.errorMessage = ' ';
        }
      },
      error: (error: any) => {
        console.log(error);
        this.anyError = true;
        this.errorMessage = 'Não foi possível efetuar login.';
      },
      complete: () => {
        loading.dismiss();
      },
    });
  }

  greetingText() {
    let split_afternoon = 12;
    let split_evening = 17;
    let currentHour = this.utilsService.getCurrentDate().getHours();

    let greeting = 'bom dia';

    if (currentHour >= split_afternoon && currentHour <= split_evening) {
      greeting = 'boa tarde';
    } else if (currentHour >= split_evening) {
      greeting = 'boa noite';
    }

    return `Olá, ${greeting}!`;
  }

  async openSupportUrl() {
    await this.utilsService.openUrl(this.supportUrl);
  }
}
