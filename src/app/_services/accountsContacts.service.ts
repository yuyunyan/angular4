import { AccountFocusObjectType } from './../_models/contactsAccount/accountFocusObjectType';
import { AccountFocusType } from './../_models/contactsAccount/accountFocusType';
import { AccountFocus } from './../_models/contactsAccount/accountFocus';
import { Injectable } from '@angular/core';
import { Response } from '@angular/http'
import { Observable } from 'rxjs/Observable';
import { HttpService } from './httpService';
import { Subject } from 'rxjs/Subject';
import { Accounts } from './../_models/contactsAccount/accounts';
import { Contacts } from './../_models/contactsAccount/contacts';
import { QuoteService }  from './quotes.service';
import { ItemsService }  from './items.service';
import { FieldPermission } from './../_models/permission/FieldPermission';
import * as _ from 'lodash';

@Injectable()
export class AccountsContactsService {
	private objectTypeIdSubject = new Subject<number>();
	private accountGroupBtnClick = new Subject<number>();
	private accountGroupChanged = new Subject<number>();

  constructor(private httpService: HttpService,private quoteService:QuoteService , private itemsService : ItemsService ) {
      
  }

  typeSelected(objectTypeId: number){
    this.objectTypeIdSubject.next(objectTypeId)
	}
	
  getTypeObjectTypeId(): Observable<number>{
    return this.objectTypeIdSubject.asObservable();
	}

  getAccounts(accountId:number,rowOffset:number,rowLimit:number,sort:string,descSort:boolean,searchString:string , accountTypeId : number, FilterCol?: string , FilterText?: string, isActive? : boolean){
    let sortColumnName: string;
    let filterColumnName : string ;
    switch(sort){
        case 'accountName':
            sortColumnName = 'AccountName';
            break;
        case 'accountNum':
            sortColumnName = 'AccountNum';
            break;
        case 'accountStatus':
            sortColumnName = 'AccountStatus';
            break;
        case 'country':
            sortColumnName = 'Country';
            break;
        case 'city':
            sortColumnName = 'City';
            break;
        case 'organization':
            sortColumnName = 'Organization';
            break;
        case 'owner':
            sortColumnName = 'Owner';
            break;
        default:
            sortColumnName = '';
    };
    switch(FilterCol){
        case 'country':
            filterColumnName = 'Country';
            break;
        case 'city':
            filterColumnName = 'City';
            break;
        case 'organization':
            filterColumnName = 'Organization';
            break;
        case 'owner':
            filterColumnName = 'Owner';
            break;
        case 'accountStatus':
            filterColumnName = 'AccountStatus';
            break;
        default:
            filterColumnName = null;
    };
    let url = 'api/accounts/getAllAccounts';
    let data = {
    SearchString: searchString,
    RowOffset: rowOffset,
    RowLimit: rowLimit,
    DescSort: descSort,
    SortBy : sortColumnName,
    AccountTypeId : accountTypeId,
    FilterBy : filterColumnName,
    FilterText : FilterText,
    AccountIsActive : isActive
    }

    return this.httpService.Post(url , data).map((response: Response) => {
    
    let res = response.json();
    let accounts = new Array<Accounts>();
    res.accounts.forEach(ac => {
            accounts.push({
                accountId:ac.accountId,
                accountName:ac.accountName,
                accountNum:ac.accountNum,
                accountType:ac.accountType,
                accountStatus:ac.accountStatus,
                countryName:ac.countryName,
                city:ac.city,
                organization:ac.organization,
                owner:ac.owner,
                totalContactCount:ac.totalContactCount
            })
        });
    return {results : accounts, totalRowCount : res.totalRowCount};
    });

  }

  getAllAccountsByUserId(userId:number){
    let url="api/accounts/getAllAccountsByUserId?userId="+(userId? userId:'');
    return this.httpService.Get(url).map(
        data=>{
            let res = data.json();
            var accounts = res.accounts.map(
                ac=>{
                    let account:Accounts;
                    account={
                        accountId:ac.accountId,
                        accountName:ac.accountName,
                        accountNum:ac.accountNum,
                        accountType:ac.accountType,
                        accountStatus:ac.accountStatus,
                        countryName:ac.countryName,
                        city:ac.city,
                        organization:ac.organization,
                        owner:ac.owner,
                        totalContactCount:ac.totalContactCount
                    }
                  return account;
                }
            )
            return {accounts:accounts,totalRowCount:res.totalRowCount};
        }
    )

  }
  
  getContactsByAccountId(accountId:number){
      let url="api/accounts/contactsByAccountId?accountId="+accountId;
      return this.httpService.Get(url).map(
          data=>{
              let res = data.json();
              var contacts = res.contacts.map(
                  co=>{
                    let contact:Contacts
                    contact={
                        contactId:co.contactId,
                        firstName:co.firstName,
                        lastName:co.lastName,
                        phone:co.phone,
                        accountId:co.accountId,
                        email:co.email,
                        owner:null,
                        title:null,
                        isActive: co.isActive == 1
                    }
                    return contact;
                  }
              )
              return contacts;
          }
      )
  }
  getAccountFocusObjectTypes(){
    let url="api/accounts/getAccountFocusObjectTypes";
    let accountFocusObjectTypes: AccountFocusObjectType[];

    return this.httpService.Get(url).map(
        data=> {
          let accountFocusObjectTypes = data.json();
          return accountFocusObjectTypes;       
        }
      )
  }
  getAccountFocusTypes(){
    let url="api/accounts/getAccountFocusTypes";
    let accountFocusTypes: AccountFocusType[];

    return this.httpService.Get(url).map(
        data=> {
          let accountFocusTypes = data.json();
          return accountFocusTypes;       
        }
      )
  }
  getAccountFocuses(accountId:number){
    let url="api/accounts/getAccountFocuses?accountId="+accountId;
    let accountFocuses : AccountFocus[];

    return this.httpService.Get(url).map(
        data=>{
           accountFocuses = data.json(); 
            return accountFocuses;
        });
}


getAccountFocusData(accountId: number){
    return Observable.forkJoin(
        this.getAccountFocuses(accountId),
        this.getAccountFocusObjectTypes(),
        this.getAccountFocusTypes(),
        this.quoteService.getCommodities(),
        this.itemsService.GetManufacturers()
    );
}
  setAccountFocus(payload){
        
    let url = 'api/account/setAccountFocus';

    return this.httpService.Post(url, payload).map(data => {
      let res = data.json();
      return res;
    });
    // let body = {
    //     focusId: accountFocus.focusId,
    //     accountId: accountFocus.accountId,
    //     focusTypeId: accountFocus.focusTypeId,
    //     objectId: accountFocus.objectId,
    //     isSpecialty: accountFocus.isSpecialty,
    //     isFranchised: accountFocus.isFranchised,
    //     isAvoided: accountFocus.isAvoided,
    // }

    // return this.httpService.Post(url, body).map(
    //     data =>
    //     { return this.mapToDomain(data.json()); },
    //     error => { return error.json(); }
    // );
}


    public deleteAccountFocus(focusId : number){
        let url = "api/account/deleteAccountFocus";
        let body = {
            focusId: focusId
        }
        return this.httpService.Post(url,body);
    }

    getAccountGroupDetailPermissions(): Array<FieldPermission>{
		return [
			{
				name: "Group Name",
				canEdit: true,
				fieldId: 0
			},
			{
				name: "Account Typeheader",
				canEdit: true,
				fieldId: 0
			},
			{
				name: "Contact Input",
				canEdit: true,
				fieldId: 0
			},
			// {
			// 	name: "Navigation Links",
			// 	canEdit: true,
			// 	fieldId: 0
			// }
		];
    }
    
    getAccountGroupList(){
        let url = 'api/account/getAccountGroupList';
        return this.httpService.Get(url).map(res => {
            return res.json();
        });
    }

    deleteAccountGroup(accountGroupId){
        let url = 'api/account/deleteAccountGroup';
        let body = {
            accountGroup: {
                accountGroupId: accountGroupId,
                groupName: ''
            }
        };
        return this.httpService.Post(url, body).map(res => {
            return res.json();
        });
    }

    accountGroupModalOpen(){
        this.accountGroupBtnClick.next(1);
    }

    getAccountGroupModalStatus(){
        return this.accountGroupBtnClick.asObservable();
    }

    onAccountGroupChanged(accountGroupId:number){
        this.accountGroupChanged.next(accountGroupId);
    }

    getAccountGroupChangeStatus(){
        return this.accountGroupChanged.asObservable();
    }

    getAccountGroupDetail(accountGroupId: number){
        let url = 'api/account/getAccountGroupDetail?accountGroupId=' + accountGroupId;
        return this.httpService.Get(url).map(res => {
            return res.json();
        });
    }

    saveAccountGroupDetail(payload){
        let url = 'api/account/setAccountGroup';
        return this.httpService.Post(url, payload).map(res => {
            return res.json();
        })
    }

    getAccountCommentTypeId(){
        let url = 'api/account/getAccountCommentTypeIds';
        return this.httpService.Get(url).map(
            data => {
                let res = data.json();
                const commentTypeMap = _.map(res.commentTypeIds, (element) => {
                    return _.assign({}, {
                        id: element.commentTypeId,
                        name: element.typeName
                    });
                });
                return commentTypeMap;
            }
        )
    }

}
