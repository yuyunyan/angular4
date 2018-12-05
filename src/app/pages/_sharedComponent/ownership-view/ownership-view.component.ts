import { Component, Input, SimpleChange, ViewEncapsulation } from '@angular/core';
import { Owner } from './../../../_models/shared/owner';
import { OwnershipService } from './../../../_services/ownership.service';
import { ImageUtilities } from './../../../_utilities/images/image-utilities'
import { Observable } from 'rxjs';
import { Subject } from 'rxjs/Subject';
import * as _ from 'lodash';
 
@Component({
	selector: 'ownership-view',
	templateUrl: './ownership-view.component.html',
	styleUrls: ['./ownership-view.component.scss'],
	encapsulation: ViewEncapsulation.None
})
export class OwnershipViewComponent {
	@Input() objectId: number;
	@Input() objectTypeId: number;
	private originalOwnersList: Owner[];
	private ngUnsubscribe: Subject<void> = new Subject<void>();

	constructor(
		private ownershipService: OwnershipService, private imageUtilities: ImageUtilities) {
		this.ownershipService.getOwnershipFresh().subscribe(data => {
			this.loadOwnership();
		});
	}

	ngOnChanges(changes: {[propKey: number]: SimpleChange}) {
		let objectId = changes['objectId'];
		if (objectId) {
			this.objectId = objectId.currentValue;
		}
		let objectTypeId = changes['objectTypeId'];
		if (objectTypeId) {
			this.objectTypeId = objectTypeId.currentValue;
		}
		this.loadOwnership();
	}

	loadOwnership(){
		if (this.objectId && this.objectTypeId) {
			this.ownershipService.GetObjectOwnership(this.objectId, this.objectTypeId)
			.takeUntil(this.ngUnsubscribe.asObservable())
			.subscribe(data => {
				this.originalOwnersList = data;
			});
		}
	}
	imageError(event) {
		event.target.src = this.imageUtilities.defaultImage
	 }
	ngOnDestroy() {
		this.ngUnsubscribe.next();
		this.ngUnsubscribe.complete();
	}
}
