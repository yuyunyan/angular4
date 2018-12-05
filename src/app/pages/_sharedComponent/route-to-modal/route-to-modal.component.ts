import { Component, Input, OnChanges, SimpleChanges, Output, EventEmitter } from '@angular/core';
import { NotificationsService } from 'angular2-notifications';
import { Observable } from 'rxjs';
import { Subject } from 'rxjs/Subject';
import * as _ from 'lodash';
import { UsersService } from './../../../_services/users.service';
import { SharedService } from './../../../_services/shared.service';

@Component({
	selector: 'route-to-modal',
	templateUrl: './route-to-modal.component.html',
	styleUrls: ['./route-to-modal.component.scss'],
})
export class RouteToModalComponent {
	isSpecificBuyer: boolean = false;
	submitEnabled: boolean = false;
	errorMessage: boolean = false;
	userList: Array<any>;
	haveSelectedUsers: boolean = false;

	@Input() quoteLineIds;
	@Output() onRouteToCompeleted: EventEmitter<any>;

	constructor(
		private usersService: UsersService,
		private notificationService: NotificationsService,
		private sharedService: SharedService
	) {

		this.usersService.getBuyers().subscribe(data => {
			this.userList = data;
		});
		this.onRouteToCompeleted = new EventEmitter<any>();
		this.ToggleBtnSubmit();

	}

	ngOnChanges(changes: SimpleChanges) {
		let quoteLineIdsProp = changes['quoteLineIds'];
		if (quoteLineIdsProp && quoteLineIdsProp.currentValue) {
		// console.log(this.quoteLineIds)
		}

  }
  routeToggle(e) {
	  this.errorMessage = false;
		let sender = e.currentTarget;
		let senderVal = (jQuery(sender).attr('data-title') === 'true');
		let senderTarget = jQuery(sender).attr('data-toggle');
		//Not toggling same value
		if (senderVal != this.isSpecificBuyer) {
			jQuery('a[data-toggle="' + senderTarget + '"]').not('[data-title="' + senderVal + '"]').removeClass('active').addClass('notActive');
			jQuery('a[data-toggle="' + senderTarget + '"][data-title="' + senderVal + '"]').removeClass('notActive').addClass('active');

			this.isSpecificBuyer = senderVal;
		}
		this.updateSelectedItems();
	}

	ToggleBtnSubmit() {
		if ((!this.isSpecificBuyer) || this.haveSelectedUsers)
			this.submitEnabled = true;
		else
			this.submitEnabled = false;
	}
	routeToCloseClicked(){
		jQuery('.checked-list-box li').removeClass('list-group-item-main');
		jQuery('.checked-list-box li span').removeClass('far fa-square');
		
		//toggle 'automatic' as default tab
		if (this.isSpecificBuyer) {
			jQuery('#routeOptions .input-group .btn-group .btn').toggleClass('notActive')
			jQuery('#routeOptions .input-group .btn-group .btn').toggleClass('active');
		}
		
		//Reset values
		this.isSpecificBuyer = false;
		this.haveSelectedUsers = false;
		this.submitEnabled = true;
		
	}

	routeToSaveClicked(){

		if (!this.quoteLineIds || this.quoteLineIds.length < 1){
			return;
		}

		let buyerIds = this.userList.filter(rs=>{ 
			return rs.isSelected === true;
		}).map(rs=>{
			return {userID: rs.UserID};
		});

		const payload = {
			buyerIds: buyerIds,
			isSpecificBuyer: this.isSpecificBuyer? 1: 0,
			quoteLineIds: _.map(this.quoteLineIds, ql => ql)
		};
		
		this.sharedService.routeQuoteLinesToUsers(payload).subscribe(data => {
			if (data > 0){
				this.notificationService.success(
					'Good Job',
					'Successfully routed the quote lines',
					{
						pauseOnHover: false,
						clickToClose: false
					}
				);
				this.onRouteToCompeleted.emit();
				this.routeToCloseClicked();
				jQuery('#divRouteModal').modal('hide');
			}else{
				this.errorMessage = true;
			}
		});

	}

	updateSelectedItems() {
		this.haveSelectedUsers = this.userList.filter(rs=>{ 
			return rs.isSelected === true; 
		}).length > 0;
		this.ToggleBtnSubmit();

	}
}
