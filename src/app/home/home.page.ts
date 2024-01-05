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
    id: '',
    amount: 0,
    type: '',
    account: '',
    des: '',
    date: new Date().toISOString(),
  };
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
  transactionlist: any[] = [];

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
          this.setSavings(this.transaction.amount);
          transactionSuccess = true;
        } else if (this.transaction.account === 'current') {
          this.setCurrent(this.transaction.amount);
          transactionSuccess = true;
        } else if (this.transaction.account === 'personal') {
          this.setTotalPersonal(this.transaction.amount);
          this.setPersonal(this.transaction.amount);
          transactionSuccess = true;
        } else {
          this.presentToast('Select the account!!');
        }
      } else if (this.transaction.type === 'expense') {
        if (this.transaction.account === 'savings') {
          this.setSavings(-this.transaction.amount);
          this.setSpent(this.transaction.amount);
          transactionSuccess = true;
        } else if (this.transaction.account === 'current') {
          this.setCurrent(-this.transaction.amount);
          this.setSpent(this.transaction.amount);
          transactionSuccess = true;
        } else if (this.transaction.account === 'personal') {
          this.setPersonal(-this.transaction.amount);
          this.setSpent(this.transaction.amount);
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
      this.setAmount();
      this.transaction.id = this.transaction.date;
      this.transactionlist = [...this.transactionlist, this.transaction];
      this.setTransaction();
      setTimeout(()=>{this.loadCart()},1000);
      this.presentToast('success');

      this.transaction = {
        id: '',
        amount: 0,
        type: '',
        account: '',
        des: '',
        date: new Date().toISOString(),
      };

      transactionSuccess = false;
      this.setOpen(false);
    } else {
      this.presentToast('failed');
    }
  }

  deleteTransaction(transactionLog: any) {

    if (transactionLog.amount > 0) {
      if (transactionLog.type === 'income') {
        if (transactionLog.account === 'savings') {
          this.setSavings(-transactionLog.amount);
        } else if (transactionLog.account === 'current') {
          this.setCurrent(-transactionLog.amount);
        } else if (transactionLog.account === 'personal') {
          this.setTotalPersonal(-transactionLog.amount);
          this.setPersonal(-transactionLog.amount);
        }
      } else if (transactionLog.type === 'expense') {
        if (transactionLog.account === 'savings') {
          this.setSavings(transactionLog.amount);
          this.setSpent(-transactionLog.amount);
        } else if (transactionLog.account === 'current') {
          this.setCurrent(transactionLog.amount);
          this.setSpent(-transactionLog.amount);
        } else if (transactionLog.account === 'personal') {
          this.setPersonal(transactionLog.amount);
          this.setSpent(-transactionLog.amount);
        }
      }
    }

    this.transactionlist = this.transactionlist.filter(
      (value, index, array) => value.id !== transactionLog.id
    );
    this.setAmount();
    this.setTransaction();
  }

  async setAmount() {
    await this._storage?.set('allAmounts', this.allAmounts);
  }

  async setTransaction() {
    await this._storage?.set('transactions', this.transactionlist);
  }

  setSpent(amount: number) {
    this.allAmounts.spent = this.allAmounts.spent + amount;
  }

  setSavings(amount: number) {
    this.allAmounts.savings = this.allAmounts.savings + amount;
  }

  setCurrent(amount: number) {
    this.allAmounts.current = this.allAmounts.current + amount;
  }

  setPersonal(amount: number) {
    this.allAmounts.personal = this.allAmounts.personal + amount;
  }

  setTotalPersonal(amount: number) {
    this.allAmounts.totalPersonal = this.allAmounts.totalPersonal + amount;
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

  calculateQuota(amount: number) {
    let date = new Date();
    let days =
      new Date(date.getUTCFullYear(), date.getUTCMonth() + 1, 0).getDate() -
      (date.getUTCDay() - 1);
    return Math.trunc(amount / days);
  }

  daysInMonth(amount: number) {
    let date = new Date();
    let days = new Date(
      date.getUTCFullYear(),
      date.getUTCMonth() + 1,
      0
    ).getDate();
    return Math.trunc(amount / days);
  }

  async loadCart() {
    let allAmt = {
      current: 0,
      savings: 0,
      spent: 0,
      personal: 0,
      totalPersonal: 0,
    };
    this.allAmounts = (await this._storage?.get('allAmounts')) || allAmt;
    this.transactionlist = (await this._storage?.get('transactions')) || [];
  }

  reverseList(list: any) {
    return list.sort((a: any, b: any) => {
      const aDate: any = new Date(b.date);
      const bDate: any = new Date(a.date);
      return aDate - bDate;
    });
    // return list.reverse();
  }
}
