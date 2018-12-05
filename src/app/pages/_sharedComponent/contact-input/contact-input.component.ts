import { Component, OnInit,AfterViewInit,ViewChild,ViewContainerRef, OnDestroy} from '@angular/core';
import { AgEditorComponent } from "ag-grid-angular";
import { QuoteService } from './../../../_services/quotes.service'
import { InputComService } from './../../../_coms/input-com.service';;
import { Observable } from 'rxjs/Observable';
import { Contacts } from './../../../_models/contactsAccount/contacts';

@Component({
    selector: 'contact-editor-cell',
		template: `
			<select
				id="contactSelectInput"
				#contactContainer 
				data-field-name="Contact Input" 
				class="form-control"
				(change)="onContactChange($event.target.value)"
				[(ngModel)]="selectedValue" name="selectedValue">
				<option *ngFor="let option of ($ContactObservable | async)" 
					[ngValue]="option.contactId">{{option.firstName + ' ' + option.lastName}}</option>
			</select>`,
		styles: []
})
export class ContactEditorComponent implements AgEditorComponent, AfterViewInit, OnDestroy {
	ngOnDestroy(): void {
		this.container.element.nativeElement.remove();
	}
	private params: any;
	private _params;
	private options: any[];
	private selectedValue:any;
	private $ContactObservable: Observable<Contacts[]>;

	constructor(
		private quoteService: QuoteService,
		private comService: InputComService) {
		// this.$ContactObservable = this.quoteService.getContactsByAccountId()
		this.comService.$supplierChanged.subscribe(accountId => {
			this.$ContactObservable = this.quoteService.getContactsByAccountId(accountId)
				.do(options => {
					this.options = options;
				});
		});
	}

	@ViewChild('contactContainer', {read: ViewContainerRef}) container;
	
	// dont use afterGuiAttached for post gui events - hook into ngAfterViewInit instead for this
	ngAfterViewInit() {}

	agInit(params:any):void {
		this._params = params;
		const supplierId = params.node.data.supplierId;
		const accountId = params.node.data.accountId;
		if (supplierId){
			this.$ContactObservable = this.quoteService.getContactsByAccountId(supplierId)
				.do(options => {
					this.options = options;
				});
		} else if (accountId){
			this.$ContactObservable = this.quoteService.getContactsByAccountId(accountId)
				.do(options => {
					this.options = options;
				});
		}
		this.selectedValue = params.value? params.value.contactId: undefined;
	}

	getValue():any {
		if (!this.options){
			return;
		}
		let option = this.options.find(x => x.contactId == this.selectedValue);
		// this._params.node.setDataValue('email', option.email);
		// return option? `${option.firstName} ${option.lastName}`: '';
		return option;
	}

	isPopup():boolean {
		return false;
	}

	focusIn(){
		this.container.element.nativeElement.focus();
	}

	onKeyDown(event):void {
		let key = event.which || event.keyCode;

		if (key == 13){
			event.stopPropagation();
		}

		if (key == 37 ||  // left
			key == 39) {  // right
			event.stopPropagation();
		}
	}

	onContactChange(selectedValue){
		if (!this.options){
			return;
		}
		let option = this.options.find(x => x.contactId == this.selectedValue);
		this._params.node.setDataValue('email', option.email);
		this._params.node.setDataValue('phone', option.phone);
	}
}
