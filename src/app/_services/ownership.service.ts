import { Injectable } from '@angular/core';
import { HttpService } from './httpService';
import { Observable } from 'rxjs/Observable';
import { Response } from '@angular/http';
import { Owner } from './../_models/shared/owner';
import { Subject } from 'rxjs/Subject';
import { ImageUtilities } from './../_utilities/images/image-utilities';
import { environment } from './../../environments/environment';
@Injectable()

export class OwnershipService {
    private ownershipFreshSubject = new Subject<any>();
    
    constructor(private httpService: HttpService, private imageUtilities: ImageUtilities) {}

    GetObjectOwnership(ObjectId: number, ObjectTypeId: number){
        let url = 'api/ownership/getObjectOwnership';
        let body = {
            ObjectID: ObjectId,
            ObjectTypeID: ObjectTypeId 
        };

        return this.httpService.Post(url, body)
            .map((res: Response) => {
                let response = res.json();
                let owners = new Array<Owner>();

                response.owners.forEach((o) => {
                    let owner = new Owner();
                    owner.id = o.id;
                    owner.name = o.name;
                    owner.percentage = o.percentage;
                    owner.ownerImageUrl =  o.ownerImageUrl? environment.apiEndPoint.replace(/\/$/, "") + '/Documents/' + o.ownerImageUrl : this.imageUtilities.defaultImage
                    owners.push(owner);
                });

                return owners;
            });
    }

    SetObjectOwnship(ObjectId: number, ObjectTypeId: number, owners: Owner[]){
        let url = 'api/ownership/setObjectOwnership';
        let ownerList = [];
        
        owners.forEach(element => {
            let p = +element.percentage;
            if (p > 0){
                ownerList.push({
                    UserId: element.id,
                    percentage: +element.percentage
                });
            }
        });
        
        let body = {
            ObjectID: ObjectId,
            ObjectTypeID: ObjectTypeId,
            OwnerList: ownerList
        };

        return this.httpService.Post(url, body)
            .map((res: Response) => {
                let response = res.json();
                let owners = new Array<Owner>();

                response.owners.forEach((o) => {
                    let owner = new Owner();
                    owner.id = o.id;
                    owner.name = o.name;
                    owner.percentage = o.percentage;
                    owners.push(owner);
                });

                return owners;
            })
    }

    ownershipFresh(){
        this.ownershipFreshSubject.next({ fresh: true })
    }

    getOwnershipFresh(): Observable<any>{
        return this.ownershipFreshSubject.asObservable();
    }
}
