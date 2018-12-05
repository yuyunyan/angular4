import {Status} from './../shared/status';
export class QuoteOptions
{
  customers:Customers[];
  contacts:ContactsList[];
  shipAddress:ShipAddress[];
  status:Status[];
}
export class Customers
{
   public name:string;
   public id:number;
}
export class ContactsList 
{
   public name:string;
   public id:number;
}
export class ShipAddress 
{
   public name:string;
   public id:number;
}