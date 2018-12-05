import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';

@Injectable()
export class RadioSelectService {
	private radioStatusSubject = new Subject<RadioStatusData>();

	radioStatusChanges(fieldId: number, newStatus: string){
		this.radioStatusSubject.next({ fieldId, newStatus})
	}

	getRadioStatus(): Observable<any>{
		return this.radioStatusSubject.asObservable();
	}
}

export class RadioStatusData{
	fieldId: number;
	newStatus: string;
};
