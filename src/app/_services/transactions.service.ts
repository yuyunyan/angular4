
import { Injectable } from '@angular/core';
import { HttpService } from './httpService';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import * as _ from 'lodash';


@Injectable()
export class TransactionsService{

    constructor(private httpService: HttpService){
    }

    getTransactions(){
        let url='api/transactions';
        return this.httpService.Get(url).map(data=>{
            let res= data.json();
            const transactions = _.map(res.transactions,(element)=>{
                return _.assign({},{
                    dateTime:element.createdAt,
                    direction:element.direction,
                    objectType:element.objectType,
                    creator:element.creator,
                    owners:element.owners,
                    payload:element.payload,
                    errors:element.errors,
                    transactionId:element.transactionId
                })
            });
            return transactions;
        });
    }
    
   

}