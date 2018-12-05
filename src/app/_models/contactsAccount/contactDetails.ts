
import { List } from 'linqts';

export class ContactDetails {
    statusId: number;
     isActive: boolean;
     firstName: string;
     lastName: string;
     title: string;
     shippingLocationId: number;
     locationId: number;
     officePhone: string;
     mobilePhone: string;
     fax: string;
     email: string;
     preferredContactId: number;
     owners: Owner[];
     externalId: string;
     note: string;
    department: string;
    jobFunctionId?: number;
    reportsTo: string;
    birthDate: string;
    gender: string;
    salutation: string;
    maritalStatus: string;
    kidsNames: string;
    accountTypeIds:number[];
    accountName: string;
}

export class ContactDetailsOptions {
     statuses: Status[];
     locations: Location[];
     preferredContactMethods: PreferredContactMethods[];
     jobFunctions: ContactJobFunction[];
}
export class Owner {
    public name: string;
    public id: number;
    public percentage: number;
}
export class Status {
    public id: number;
    public name: string;
}
export class Location {
    public locationId:number;
    public name: string;
    public houseNo: string;
    public street: string;
    public city: string;
    public typeId:number;
    public stateCode?: string;
    public postalCode?: string;
    public countryCode?: string;
    public formattedState?: string;
    public locationTypeName:string;
}
export class PreferredContactMethods {
    public id: number;
    public name: string;
}

export class ContactJobFunction{
    jobFunctionId: number;
    jobFunctionName: string;
}
