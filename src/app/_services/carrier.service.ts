import { Injectable } from '@angular/core';
import { HttpService } from './httpService';
import { Observable } from 'rxjs/Observable';
import * as _ from 'lodash'; 
import { AccountCarrier} from './../_models/carrier/accountCarrier';
import { CarrierList} from './../_models/carrier/carrierList';

@Injectable()
export class CarrierService{
    constructor(private httpService:HttpService){   

    }

getAccountCarrier(accountId:number){
   
    let url='api/carrier/AccountCarrierList?accountId=' +accountId;
    return this.httpService.Get(url).map(data=>{
       
        let res= data.json();
        let carriers = new Array<AccountCarrier>();
        res.accountCarriers.forEach(element => {
            carriers.push({
                accountId:element.accountID,
                accountNumber:element.accountNumber,
                carrierId:element.carrierID,
                carrierName:element.carrierName,
                isDefault:element.isDefault 
            })
        });
        return carriers;
    })
}
getCarriers(){
    let url='api/carrier/CarrierList';
    return this.httpService.Get(url).map(data=>{
        let res= data.json();
        let carrierList = new Array<CarrierList>();
        res.carriers.forEach(element => {
            carrierList.push({
                carrierId:element.carrierID,
                carrierName:element.carrierName
            })
        });
        return carrierList;
    })
}

editCreateCarrier(accountId:number,carrierId:number,accountNumber:string,isDefault:boolean){
    let url='api/carrier/AccountCarrierSet';
    let body={
        AccountId:accountId,
        carrierId:carrierId,
        AccountNumber:accountNumber,
        IsDefault:isDefault
    }
    
   return this.httpService.Post(url,body).map(data=>{
    let res= data.json();
    return res.isSuccess;
   }
     
)
}

deleteAccountCarrier(accountId:number,carrierId:number){
    let url='api/carrier/DeleteAccountCarrier';
    let body={
        CarrierID:carrierId,
        AccountID:accountId
    }
    return this.httpService.Post(url,body).map(data=>{
        let res= data.json();
        return res.isSuccess;
    })
}


}