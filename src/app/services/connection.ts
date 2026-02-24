import { Network } from '@capacitor/network';
import { Injectable, EventEmitter } from '@angular/core';

@Injectable()
export class ConnectionService {
  public isOnline: boolean = false;
  public eventOnline: EventEmitter<any> = new EventEmitter();
  public status: any;

  constructor() {
    this.init();
  }

  init() {
    Network.getStatus().then((status) => {
      this.status = status;

      if (this.status.connectionType != 'none') {
        this.isOnline = true;
      }

      this.setStatus(this.isOnline);
    });

    Network.addListener('networkStatusChange', (status) => {
      this.status = status;
      this.setStatus(status.connected);
    });
  }

  setStatus(online: boolean) {
    this.isOnline = online;
    this.eventOnline.emit(this.isOnline);
  }

  getNetworkType() {
    return this.status.connectionType;
  }
}
