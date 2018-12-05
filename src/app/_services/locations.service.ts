import { Injectable } from '@angular/core';
import { HttpService } from './httpService';
import { Observable } from 'rxjs/Observable';
import { List } from 'linqts';
import { Response } from '@angular/http';
import { Locations } from './../_models/contactsAccount/locations';
import { Countries } from './../_models/region/countries';
import { States } from './../_models/region/states';
import { LocationType } from './../_models/contactsAccount/locationType';

@Injectable()
export class LocationService {
    constructor(private httpService: HttpService) {

    }
    getLocationDetails(LocationID: number) { 
        let url = 'api/account/getLocationDetails?locationId=' + LocationID;
        return this.httpService.Get(url);
    }

    getAccountBillingAddress(AccountID: number) {
        let url = 'api/account/getAccountBillingAddress?accountId=' + AccountID;
        return this.httpService.Get(url).map(data => {
            let res = data.json();
            return res;
        });
    }

    getAccountNonBillingLocations(AccountID: number) {
        let url = 'api/account/GetAccountNonBillingLocations?accountId=' + AccountID;
        return this.httpService.Get(url).map(
            data => {
                let res = data.json();

                var locations = new Array<Locations>();
                res.locations.forEach(element => {

                    let loc = new Locations();
                    loc.LocationID = element.locationId;
                    loc.AccountID = element.accountId;
                    loc.LocationName = element.name;
                    loc.HouseNumber = element.houseNo;
                    loc.Street = element.street;
                    loc.City = element.city;
                    loc.StateCode = element.stateCode;
                    loc.PostalCode = element.postalCode;
                    locations.push(loc);
                })

                return locations;
            }
        )

    }
    
    getCountryList() {
        let url = 'api/account/GetCountryList';
        return this.httpService.Get(url).map(
            data => {
                let res = data.json();

                var countries = new List<Countries>();
                res.countryList.forEach(element => {

                    let con = new Countries();
                    con.CountryID = element.countryId;
                    con.CountryName = element.name;
                    con.CountryCode = element.countryId;
                    con.CodeForSap = element.codeForSap
                    countries.Add(con);
                })


                return { results: countries, error: null };
            }, error => {
                console.log("Countries service call failed");
            })

           
    }
    getStateList(countryId: number) {
        let url = 'api/account/GetStateList?countryid=' + countryId;
        return this.httpService.Get(url).map(
            data => {
                let res = data.json();
                console.log(res);

                var states = new List<States>();
                res.stateList.forEach(element => {

                    let state = new States();
                    state.StateID = element.stateId;
                    state.StateName = element.name;
                    state.StateCode = element.code
                    states.Add(state);
                })


                return { results: states, error: null };
            }, error => {
                console.log("States service call failed with countryID: " + countryId);
            })


    }
    getLocationsByAccount(AccountID: number) {
        let url = 'api/account/getAccountlLocations?accountId=' + AccountID;
        return this.httpService.Get(url).map(
            data => {
                let res = data.json();

                var locations = new List<Locations>();
                res.locations.forEach(element => {
                    let loc = new Locations();
                    loc.LocationID = element.locationId;
                    loc.AccountID = element.accountId;
                    loc.LocationName = element.name;
                    loc.CountryID = element.countryId
                    loc.LocationTypeID = element.typeId;
                    loc.LocationTypeName = element.locationTypeName;
                    loc.AddressLine1 = element.addressLine1;
                    loc.AddressLine2 = element.addressLine2;
                    loc.AddressFull = (element.houseNo || '') + ' ' + (element.street? element.street + ', ': '')
                        + (element.city? element.city + ', ': '') + (element.formattedState || '') + ' ' + (element.postalCode || '');
                    loc.HouseNumber = element.houseNo;
                    loc.Street = element.street;
                    loc.AddressLine4 = element.addressLine4;
                    loc.City = element.city;
                    loc.StateID = element.stateId;
                    //loc.StateCode = element.StateCode;
                    loc.PostalCode = element.postalCode;
                    loc.District = element.district;
                    loc.Note = element.Note;
                    locations.Add(loc);
                })

                return { results: locations, error: null };
            }, error => {
                console.log("Location service call failed");
            }

        )
    }

    DeleteLocation(LocationID: number, AccountID: number) {
        let url = 'api/account/deleteLocation';
        let body = {
            locationId: LocationID,
            accountId: AccountID,
            isDeleted: true,
        }
        return this.httpService.Post(url, body);
    }
    UndoDeleteLocation(LocationID: number, AccountID: number) {
        let url = 'api/account/setLocationDetails';
        let body = {
            locationId: LocationID,
            accountId: AccountID,
            isDeleted: false,
        }
        return this.httpService.Post(url, body);
    }

    SaveLocationType(LocationID: number, AccountID: number, LocationTypeID: number){
        let url = 'api/account/setLocationDetails';
        let body = {
            locationId: LocationID,
            accountId: AccountID,
            typeId: LocationTypeID
        }
        return this.httpService.Post(url, body);
    }

    SaveLocation(location: any) {
        let url = 'api/account/setLocationDetails';
        let body = {
            locationId: location.locationId,
            accountId: location.accountId,
            name: location.name,
            addressLine1: location.addressLine1,
            addressLine2: location.addressLine2,
            houseNo: location.houseNo,
            street: location.street,
            addressLine4: location.addressLine4,
            city: location.city,
            stateId: location.stateId,
            postalCode: location.postalCode,
            countryId: location.countryId,
            typeId: location.typeId,
            district: location.district,
            locationTypeExternalIds: location.locationTypeExternalId,
            externalId: location.externalId,
            countryCode2: location.countryCode2,
            stateCode: location.stateCode,
            Note: location.Note
        }
        return this.httpService.Post(url, body);
    }

    SaveLocationShipTo(location: Locations) {
        let url = 'api/account/setLocationDetails';
        let body = {
            locationId: location.LocationID,
            accountId: location.AccountID,
            name: location.LocationName,
            addressLine1: location.AddressLine1,
            addressLine2: location.AddressLine2,
            houseNo: location.HouseNumber,
            street: location.Street,
            addressLine4: location.AddressLine4,
            city: location.City,
            stateId: location.StateID,
            postalCode: location.PostalCode,
            countryId: location.CountryID,
            typeId: location.LocationTypeID,
            district: location.District,
            locationTypeExternalIds: null,
            externalId: location.ExternalId,
            countryCode2: location.CountryID,
            stateCode: location.StateCode,
            Note: location.Note
        }
        return this.httpService.Post(url, body);
    }

    getLocationTypes()
    {
        let url = 'api/account/locationTypes';
        return this.httpService.Get(url).map(
            data => {
                let res = data.json();
                
                var locationTypes = new Array<LocationType>();
                res.locationTypes.forEach(element => {

                    let locationType = new LocationType();
                    locationType.id = element.id;
                    locationType.name = element.name;
                    locationType.externalId = element.externalId;
                    locationTypes.push(locationType);
                })

                return { results: locationTypes, error: null };
            }, error => {
                console.log("Location types service call failed");
            })
    }

    GetShipToLocations(isDropShip: boolean, filterUnique: boolean){
        let url = 'api/account/getShipToLocations?isDropShip=' + (isDropShip? 0: 1) + '&filterUnique=' + filterUnique;
        return this.httpService.Get(url).map(
            data => {
                let res = data.json();

                var locations = new Array<Locations>();
                res.locations.forEach(element => {

                    let loc = new Locations();
                    loc.LocationID = element.locationId;
                    loc.AccountID = element.accountId;
                    loc.LocationName = element.name;
                    loc.HouseNumber = element.houseNo;
                    loc.Street = element.street;
                    loc.City = element.city;
                    loc.StateCode = element.stateCode;
                    loc.PostalCode = element.postalCode;
                    locations.push(loc);
                })

                return locations;
            }
        ) 
    }
}
