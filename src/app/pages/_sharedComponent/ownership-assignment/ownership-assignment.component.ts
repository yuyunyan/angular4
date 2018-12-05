import { Component, Input, OnChanges, SimpleChange,OnDestroy} from '@angular/core';
import { Owner } from './../../../_models/shared/owner';
import { UserDetail } from './../../../_models/userdetail';
import { UsersService } from './../../../_services/users.service';
import { OwnershipService } from './../../../_services/ownership.service';
import { NotificationsService } from 'angular2-notifications';
import { Observable } from 'rxjs';
import { Subject } from 'rxjs/Subject';
import * as _ from 'lodash';
 
@Component({
    selector: 'ownership-assignment',
    templateUrl: './ownership-assignment.component.html'
})
export class OwnershipAssignmentComponent implements OnDestroy {
    private usersList$: Observable<UserDetail[]>;
    @Input() objectId: number;
    @Input() objectTypeId: number;
    private originalOwnersList: Owner[];
    private owners: Owner[];
    private ownersSaved:boolean;
    private formError:string;
    private ngUnsubscribe: Subject<void> = new Subject<void>();

    constructor(private usersService: UsersService,
        private ownershipService: OwnershipService,
        private notificationsService: NotificationsService) {
        this.owners = new Array<Owner>();
        this.usersList$ = this.usersService.getAllUsers();
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

        if (this.objectId && this.objectTypeId) {
            this.ownershipService.GetObjectOwnership(this.objectId, this.objectTypeId).takeUntil(this.ngUnsubscribe.asObservable())
            .subscribe(data => {
                this.originalOwnersList = data;
                this.resetOwners(this.originalOwnersList);
            });
        }
    }

    private ownersCloseClicked() {
        this.owners = [];
        this.resetOwners(this.originalOwnersList);
        this.formError = "";
        if (!this.ownersSaved) {
            this.notificationsService.warn('Changes to owners discarded');
        }
        this.ownersSaved = false;
    }

    ownersSaveClicked() {
        if (this.owners.length < 1){
            this.formError = "At least one owner is required.";
            return;
        }
        let percentages = this.owners.map(element => {return +element.percentage});
        let total = percentages.reduce(this.getSum);
        const ownerIds = _.map(this.owners, o => o.id);
        const emptyOwner = _.some(ownerIds, ownerId => {
            let numbId = +ownerId;
            return numbId == 0; 
        });
        const invalidPercentages = _.some(percentages, p => {
            let pNumber = +p;
            return p < 0;
        });
        console.log('invalidPercentages',invalidPercentages)
        const nameSet = new Set(ownerIds);
        let hasDuplicate = nameSet.size !== ownerIds.length;

        if(total != 100){
            this.formError = "The total should be 100%";
        } else if (hasDuplicate){
            this.formError = "Check duplicate owners.";
        } else if (emptyOwner){
            this.formError = "User or Group cannot be empty.";
        } else if (invalidPercentages){
            this.formError = "Percentage cannot be negative.";
        } else {
            this.ownersSaved = true;
            this.ownershipService.SetObjectOwnship(this.objectId, this.objectTypeId, this.owners)
                .takeUntil(this.ngUnsubscribe.asObservable())
                .subscribe(data => {
                    this.originalOwnersList = this.owners.slice();
                    this.ownershipService.ownershipFresh();
                    this.notificationsService.success( 'Good Job', 'Successfully saved the owners');
                    document.getElementById('ownershipClose').click();
                    this.formError = "";
            });
            
        }
    }

    private createNewOwner(){
        let newOwner = new Owner();
        newOwner.id= 0;
        newOwner.percentage = 0;
        this.owners.push(newOwner);
    }

    private resetOwners(values: Array<Owner>) {
        _.forEach(values, (element) => {
            let owner = new Owner();
            owner.id = element.id;
            owner.name = element.name;
            owner.percentage = element.percentage;
            this.owners.push(owner);
        });
    }
    
    onDeleteOwner(owner){
        console.log(owner);
        this.owners = _.without(this.owners, owner);
    }

    private getSum(total, num) {
        return total + num;
    }
  ngOnDestroy() {
   this.ngUnsubscribe.next();
   this.ngUnsubscribe.complete();
  }

    
}
