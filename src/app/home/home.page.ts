import { Component, OnInit, ViewChild } from '@angular/core';
import { IonModal, ToastController } from '@ionic/angular';
import { Storage } from '@ionic/storage-angular';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {
  @ViewChild(IonModal) modal: IonModal | any;
  _storage: Storage | null = null;
  isModalOpen = false;
  trans = {
    amount: 0,
    type: '',
    account: '',
    des: '',
    date: new Date()
  };
  actionSheetButtons = [
    {
      text: 'Reset',
      role: 'destructive',
      data: {
        action: 'reset',
      },
    },
    {
      text: 'Cancel',
      role: 'cancel',
      data: {
        action: 'cancel',
      },
    },
  ];
  current: any = 0;
  savings: any = 0;
  spent: any = 0;
  transactionlist:any = [];

  constructor(
    private storage: Storage,
    private toastController: ToastController
  ) {}

  async ngOnInit() {
    const storage = await this.storage.create();
    this._storage = storage;
    this.loadCart();
  }

  async set() {
    let transactionSuccess = false;
    let transaction = [];
    transaction = (await this._storage?.get('trans')) || [];

    if (this.trans.amount > 0) {
      if (this.trans.type === 'income') {
        if (this.trans.account === 'savings') {
          let savings = (await this._storage?.get('savings')) || 0;
          savings = savings + this.trans.amount;
          await this._storage?.set('savings', savings);
          transactionSuccess = true;
        } else if (this.trans.account === 'current') {
          let current = (await this._storage?.get('current')) || 0;
          current = current + this.trans.amount;
          await this._storage?.set('current', current);
          transactionSuccess = true;
        } else {
          this.presentToast('Select the account!!');
        }
      } else if (this.trans.type === 'expense') {
        if (this.trans.account === 'savings') {
          let savings = (await this._storage?.get('savings')) || 0;
          savings = savings - this.trans.amount;
          await this._storage?.set('savings', savings);
          let spent = (await this._storage?.get('spent')) || 0;
          spent = spent + this.trans.amount;
          transactionSuccess = true;
        } else if (this.trans.account === 'current') {
          let current = (await this._storage?.get('current')) || 0;
          current = current - this.trans.amount;
          await this._storage?.set('current', current);
          let spent = (await this._storage?.get('spent')) || 0;
          spent = spent + this.trans.amount;
          transactionSuccess = true;
        } else {
          this.presentToast('Select the account!!');
        }
      } else {
        this.presentToast('Select the type!!');
      }
    } else {
      this.presentToast('Enter valid amount!!');
    }

    if (transactionSuccess) {
      transaction = [...transaction, this.trans];
      await this._storage?.set('trans', transaction);
      this.presentToast('success');

      this.trans = {
        amount: 0,
        type: '',
        account: '',
        des: '',
        date: new Date()
      };

      transactionSuccess = false;
      this.setOpen(false);
    } else {
      this.presentToast('failed');
    }
    this.loadCart();
  }

  async reset(event: any) {
    if (event.detail.data.action === 'reset') {
      await this._storage?.clear();
      this.presentToast('Everything is reset');
      this.loadCart();
    }
  }

  setOpen(isOpen: boolean) {
    this.isModalOpen = isOpen;
  }

  async presentToast(msg: string) {
    const toast = await this.toastController.create({
      message: msg,
      duration: 1500,
      position: 'bottom',
    });
    await toast.present();
  }

  async loadCart() {
    this.savings = (await this._storage?.get('savings')) || 0;
    
    this.current = (await this._storage?.get('current')) || 0;

    this.spent = (await this._storage?.get('spent')) || 0;

    this.transactionlist = (await this._storage?.get('trans')) || [];
  }

  dateToMillisec(date:Date){
    return new Date(date).getTime();
  }
}
