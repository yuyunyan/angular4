import { Component, ViewEncapsulation, Output, EventEmitter, Input, OnChanges, SimpleChange } from '@angular/core';
import { BOMsService } from './../../../../_services/boms.service';
import { Contacts } from './../../../../_models/contactsAccount/contacts';
import { Customers } from './../../../../_models/quotes/quoteOptions';
import { FlaggedGridItem } from './../../../../_models/bom/FlaggedGridItem';
import { Subject } from 'rxjs/Subject';
import { Subscription } from 'rxjs/Subscription';

@Component({
	selector: 'az-items-flagged-master',
	templateUrl: './items-flagged-master.component.html',
	styleUrls: ['./items-flagged-master.component.scss'],
	encapsulation: ViewEncapsulation.None
})
export class ItemsFlaggedMasterComponent {
	private createOptions;
	private createObjectType: number;

	@Input() flaggedGridItems: FlaggedGridItem[];
	@Output() onCloseModal = new EventEmitter<any>();
	@Output() onSaveItemsFlaggedSuccess = new EventEmitter<any>();

	private itemsFlagged;

	constructor() {
		this.createObjectType = 3;
		this.createOptions = [
			{id: 1, name: 'Quote'},
			{id: 2, name: 'Vendor RFQ'},
			{id: 3, name: 'Purchase Order'}
		];
	}

	ngOnChanges(changes: { [propKey: string]: SimpleChange }){
		let flagPartNumberProp = changes["flaggedGridItems"];
    if (flagPartNumberProp && !flagPartNumberProp.firstChange) {
			const flagPartNumbers = flagPartNumberProp.currentValue;
			console.log('Items-flagged-master, flagPartNumber: ', flagPartNumbers);
			this.itemsFlagged = flagPartNumbers.map((flagPart: FlaggedGridItem) => {
				return {
					partNumber: flagPart.partNumber,
					manufacturer: flagPart.manufacturer,
					price: 0,
					cost: 0,
					qty: 0,
					itemId: flagPart.itemId? flagPart.itemId: 0
				}
			});
    }
	}

	onCreateTypeChange(){

	}
}
