import { Injectable } from '@angular/core';
import { Subject }    from 'rxjs/Subject';
 
@Injectable()
export class InputComService {
 
  // Observable string sources
  private selectedCommodity = new Subject<string>();
  private enableDisableSubject = new Subject<boolean>();
  private mfrSubject = new Subject<string>();
  private supplierSubject = new Subject<number>();
  
  // Observable string streams
  $commodityChanged = this.selectedCommodity.asObservable();
  $enableDisable = this.enableDisableSubject.asObservable();
  $mfrChanged = this.mfrSubject.asObservable();
  $supplierChanged = this.supplierSubject.asObservable();

  // Service message commands
  comoditySelected(commodity: string) {
    this.selectedCommodity.next(commodity);
  }

  changeMfr(mfr:string){
    this.mfrSubject.next(mfr);
  }

  enableInput(enable: boolean){
    this.enableDisableSubject.next(enable);
  }

  changeContacts(accountId: number){
    this.supplierSubject.next(accountId);
  }
}
