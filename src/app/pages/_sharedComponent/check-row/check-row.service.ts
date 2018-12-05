import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';

@Injectable()
export class CheckRowService {
	private checkboxSubject = new Subject<CheckboxStatusData>();

	checkboxStatusChanges(permissionId: number, checked: boolean){
		this.checkboxSubject.next({ permissionId, checked})
	}

	getCheckboxStatus(): Observable<any>{
		return this.checkboxSubject.asObservable();
	}
}

export class CheckboxStatusData{
	permissionId: number;
	checked: boolean
};
