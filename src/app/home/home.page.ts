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
  transaction = {
    id: new Date().toString().split(' ').join(''),
    amount: 0,
    type: '',
    account: '',
    des: '',
    date: new Date(),
  };
  date:any;
  allAmounts: any;
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
  transactionlist: any = [];

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

    if (this.transaction.amount > 0) {
      if (this.transaction.type === 'income') {
        if (this.transaction.account === 'savings') {
          this.allAmounts.savings =
            this.allAmounts.savings + this.transaction.amount;
          this.setAmount();
          transactionSuccess = true;
        } else if (this.transaction.account === 'current') {
          this.allAmounts.totalIncome =
            this.allAmounts.totalIncome + this.transaction.amount;
          this.allAmounts.current =
            this.allAmounts.current + this.transaction.amount;
          this.setAmount();
          transactionSuccess = true;
        } else {
          this.presentToast('Select the account!!');
        }
      } else if (this.transaction.type === 'expense') {
        if (this.transaction.account === 'savings') {
          this.allAmounts.savings =
            this.allAmounts.savings - this.transaction.amount;
          this.allAmounts.spent =
            this.allAmounts.spent + this.transaction.amount;
          this.setAmount();
          transactionSuccess = true;
        } else if (this.transaction.account === 'current') {
          this.allAmounts.current =
            this.allAmounts.current - this.transaction.amount;
          this.allAmounts.spent =
            this.allAmounts.spent + this.transaction.amount;
          this.setAmount();
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
      this.transaction.date = this.date;
      this.transactionlist = [...this.transactionlist, this.transaction];
      await this._storage?.set('transactions', this.transactionlist);
      this.presentToast('success');

      this.transaction = {
        id: new Date().toString().split(' ').join(''),
        amount: 0,
        type: '',
        account: '',
        des: '',
        date: new Date(),
      };

      transactionSuccess = false;
      this.setOpen(false);
    } else {
      this.presentToast('failed');
    }
    this.loadCart();
  }

  async setAmount() {
    await this._storage?.set('allAmounts', this.allAmounts);
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
  calculateQuota(current: number) {
    let date = new Date();
    let days =
      new Date(date.getUTCFullYear(), date.getUTCMonth() + 1, 0).getDate() -
      (date.getUTCDay() - 1);
    return Math.trunc(current / days);
  }

  daysInMonth(amount:number) {
    let date = new Date();
    let days = new Date(date.getUTCFullYear(), date.getUTCMonth() + 1, 0).getDate();
    return Math.trunc(amount / days);
  }

  async loadCart() {
    let allAmt = {
      current: 0,
      savings: 0,
      spent: 0,
      quota: 0,
      totalIncome: 0,
    };

    this.allAmounts = (await this._storage?.get('allAmounts')) || allAmt;

    this.transactionlist = (await this._storage?.get('transactions')) || [];
  }

  reverseList(list:any){
    return list.sort((a:any,b:any)=> {
      const aDate:any = new Date(b.date); 
      const bDate:any = new Date(a.date);
      return aDate - bDate;
    });
    // return list.reverse();
  }
}
