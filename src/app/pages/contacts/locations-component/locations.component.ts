import { Component, OnInit, ViewEncapsulation,OnDestroy } from '@angular/core';
import { GridOptions, ColumnApi } from "ag-grid";
import { LocationService } from './../../../_services/locations.service';
import { Locations } from './../../../_models/contactsAccount/locations';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { NotificationsService } from 'angular2-notifications';
import { Subject } from 'rxjs/Subject';
import { LocationType } from './../../../_models/contactsAccount/locationType';
import { Countries } from './../../../_models/region/countries';
import { States } from './../../../_models/region/states';
import { List } from 'linqts';
import { CustomHeaderComponent } from './../../_sharedComponent/az-custom-header/az-custom-header.component';
import * as _ from 'lodash';

@Component({
    selector: 'az-locations-component',
    templateUrl: './locations.component.html',
    styleUrls: ['./locations.component.scss'],
    encapsulation: ViewEncapsulation.None
})

export class LocationsComponent implements OnInit,OnDestroy {
    private LocationsGridOptions: GridOptions;
    private LocationsData = [];
    private columnDefs: any[];
    private locations: Locations[];
    public LocationID: number;
    public AccountID: number;
    public message: string;
    public locationNotifyOptions = {
        position: ['top', 'right'],
        timeOut: 90000,
        pauseOnHover: true,
        lastOnBottom: true,
        //clickToClose: true
    }

    private ngUnsubscribe: Subject<void> = new Subject<void>();
    private locationTypes: LocationType[];
    private selectedLocationTypeId: number;
    private countries: Countries[];
    private selectedCountryCode2: string;
    private states: States[];
    private selectedStateCode: string; 
    private externalId:string;
    private locationTypeBitwise: number;

    //any other variables to declare here? Atleast ones we are submitting to the API/Messing with ?
    constructor(private locationService: LocationService, private router: Router, private activatedRoute: ActivatedRoute, 
        private _notificationsService: NotificationsService) {
        this.activatedRoute.params.takeUntil(this.ngUnsubscribe.asObservable())
        .subscribe((params: Params) => {
            this.AccountID = params["accountId"];
            console.log("Account ID: " + this.AccountID);
            //Do we need to pull data here? like //this.usersService.getUser(this.userId).subscribe(userResponse => {
        });
        this.locationTypeBitwise = 0;
        this.LocationsGridOptions = {
            toolPanelSuppressSideButtons: true,
            rowSelection:"single",
            rowHeight:30,
            suppressContextMenu:true,
            paginationPageSize:5,
            pagination:true,
            defaultColDef: {
                suppressMenu: true
              }
        
        }
    }

    ngOnInit() {
        var _self = this;
        //this.getAccountBillingAddress();
        this.CreateLocationsGrid(_self);
        this.populateLocationsGrid();

        //Populate Countries
        //this.populateCountriesList(_self);
        this.populateAddressTypes();
    }

    populateAddressTypes(){
        this.locationService.getLocationTypes().takeUntil(this.ngUnsubscribe.asObservable()).subscribe(
            data => {
                this.locationTypes = data.results;   
            }
        );

        this.locationService.getCountryList().takeUntil(this.ngUnsubscribe.asObservable()).subscribe(
            data => {
                this.countries = data.results.ToArray();
            }
        );
    }

    // getAccountBillingAddress() {
    //     this.locationService.getAccountBillingAddress(this.AccountID).takeUntil(this.ngUnsubscribe.asObservable())
    //         .subscribe(
    //         data => {
    //             
    //             var res = data;
    //             if (res) {
    //                 
    //                 //Success
    //                 (<HTMLInputElement>document.getElementById('lblLocationName')).textContent = res.name;
    //                 (<HTMLInputElement>document.getElementById('lblHouseNumber')).textContent = res.houseNo;
    //                 (<HTMLInputElement>document.getElementById('lblStreet')).textContent = res.street;
    //                 (<HTMLInputElement>document.getElementById('lblCity')).textContent = res.city;
    //                 (<HTMLInputElement>document.getElementById('lblState')).textContent = res.state;
    //                 (<HTMLInputElement>document.getElementById('lblPostalCode')).textContent = res.postalCode;
    //             }
    //         })
    // }
    DeleteLocation() {
        var _self = this;
        console.log('location delete triggered: LocationID: ' + this.LocationID);
        this.locationService.DeleteLocation(this.LocationID, this.AccountID).takeUntil(this.ngUnsubscribe.asObservable())
        .subscribe(data => {

            //Hide Modal
            jQuery('#mdlDeleteChecker').modal('hide');

            //Repopulate Grid
            _self.populateLocationsGrid();
                
            //Toast success message
            _self._notificationsService.success(
                'Deleted',
                'Location has been deleted.'
            );

        });
    }
    
    UndoDeleteLocation() {
        var _self = this;
        console.log('location undo-delete triggered: LocationID: ' + this.LocationID);
        this.locationService.UndoDeleteLocation(this.LocationID, this.AccountID).takeUntil(this.ngUnsubscribe.asObservable())
        .subscribe(data => {
            //Repopulate Grid
            _self.populateLocationsGrid();

            //Toast success message
            _self._notificationsService.success(
                'Saved!',
                'Location re-added!',
            )

        });
    }
    CreateLocationsGrid(_self) {
        this.LocationsGridOptions.columnDefs = [
            {
                headerName: "Name",
                field: "LocationName",
                headerClass: "grid-header",
                width: 250
            },
            {
                headerName: "Type",
                field: "LocationTypeName",
                headerClass: "grid-header",
                width: 200

            },
            {
                headerName: "Address",
                field: "AddressFull",  //Handle full address on front end
                headerClass: "grid-header",
                width: 300
            },
            {
                headerName: "Note",
                field: "Note",
                headerClass: "grid-header",
                width: 250

            },
            {
                headerName: "", //Edit Button                
                headerClass: "grid-header",
                field: "LocationID",
                //headerClass: "grid-header",
                width: 50,
                cellRenderer: function (params) {
                    var eDiv = document.createElement('div');
                    eDiv.innerHTML = '<button class="btn-link btn-edit-grid btn-locationEdit" style="padding-top: 5px;" data-target="#mdlContactEdit" data-toggle="modal"><i class="fas fa-pen-square fa-2x" aria="hidden"></i></button>';
                    var ebutton = eDiv.querySelectorAll('.btn-locationEdit')[0];
                    ebutton.addEventListener('click', function () {
                        console.log('parameter data:')
                        console.log(params.data);
                        _self.locationService.getLocationDetails(params.data.LocationID)
                            .subscribe(
                            data => {
                                var res = data.json();
                                this.location = res;
                                
                                if (res) {
                                    //Success
                                    _self.LocationID = params.data.LocationID;
                                    //_self.locationTypeBitwise = res.typeId;
                                    _self.selectedCountryCode2 = res.countryCode2;
                                    _self.selectedStateCode = res.stateCode;
                                    // _self.externalId = res.externalId;
                                    console.log('Location ID: ' + params.data.LocationID + ' Details: ');
                                    console.log(res);

                                    //Populate Data
                                    (<HTMLInputElement>document.getElementById('txtLocationName')).value = res.name;
                                    (<HTMLInputElement>document.getElementById('txtAddress1')).value = res.addressLine1;
                                    //(<HTMLInputElement>document.getElementById('txtAddress2')).value = res.addressLine2;
                                    (<HTMLInputElement>document.getElementById('txtHouseNumber')).value = res.houseNo;
                                    (<HTMLInputElement>document.getElementById('txtStreet')).value = res.street;
                                    //(<HTMLInputElement>document.getElementById('txtAddress4')).value = res.addressLine4;
                                    (<HTMLInputElement>document.getElementById('txtCity')).value = res.city;
                                    (<HTMLInputElement>document.getElementById('txtPostalCode')).value = res.postalCode;
                                    (<HTMLInputElement>document.getElementById('txtDistrict')).value = res.district;
                                    //(<HTMLInputElement>document.getElementById('ddlCountry')).value = res.countryId;
                                    (<HTMLTextAreaElement>document.getElementById('txtNotes')).value = res.Note;
                                    _self.setLocationTypeCheckboxes(params.data.LocationTypeId);
                                    if (res.stateId) {
                                        _self.onCountryChange(res.countryId);

                                }                                        setTimeout(function () {
                                            (<HTMLInputElement>document.getElementById('ddlState')).value = res.stateId;
                                        }, 200);                                        
                                    }
                                else {
                                    _self.message = "failed to get location";
                                }
                            },
                            error => {
                                _self.message = "failed with message " + error;
                            }
                            );
                    });

                    return eDiv;
                },
                cellStyle: { 'text-align': 'center' }
            },
            {
                headerName: "",
                headerClass: "grid-header",
                headerComponentFramework: <{ new(): CustomHeaderComponent }>CustomHeaderComponent,
                //headerComponentParams: { menuIcon: 'fas fa-times' },
                cellRenderer: function (params) { return _self.deleteLocationChecker(params, _self) },
                cellStyle: { 'text-align': 'center' },
                minWidth: 20,
                maxWidth: 50,
                width: 40
            }
        ];
    }

    deleteLocationChecker(params, _self){
        let anchor = document.createElement('a');
        let i = document.createElement('i');
        i.className = 'fas fa-times';
        i.style.color = 'red';
        i.style.fontSize = '20px';
        i.title = "Delete Location";
        i.setAttribute('aria-hidden', 'true');
        anchor.appendChild(i);
        anchor.href = "javascript:void(0)";
        
        anchor.addEventListener("click",function(){
            //            
            _self.LocationID = params.data.LocationID;   
            if(params.data.LocationTypeId & 1){
                _self._notificationsService.warn(
                           'Oops...',
                           'Cannot Delete Location with Bill-To Type'
                );
                return;
            }
            jQuery('#mdlDeleteChecker').modal('toggle');           
        });

        return anchor;
    }

    locationTypeChanged($event, val){
        if($event.target.checked){
            this.locationTypeBitwise += val;
        }else{
            this.locationTypeBitwise -= val;
        }
        if (!this.locationTypeBitwise){
            jQuery('#locationTypeInvalid').css('display', 'block');
        } else{
            jQuery('#locationTypeInvalid').css('display', 'none');
        }
    }

    NewLocation() {
        this.LocationID = null;
         (<HTMLInputElement>document.getElementById('txtLocationName')).value = '';
         (<HTMLInputElement>document.getElementById('txtAddress1')).value = '';
        // (<HTMLInputElement>document.getElementById('txtAddress2')).value = '';
        (<HTMLInputElement>document.getElementById('txtHouseNumber')).value ='';
        (<HTMLInputElement>document.getElementById('txtStreet')).value = '';
        // (<HTMLInputElement>document.getElementById('txtAddress4')).value = '';
        (<HTMLInputElement>document.getElementById('txtCity')).value = '';
        (<HTMLInputElement>document.getElementById('txtPostalCode')).value = '';
        (<HTMLInputElement>document.getElementById('txtDistrict')).value = '';
        (<HTMLInputElement>document.getElementById('txtNotes')).value = '';

        this.selectedCountryCode2 = this.countries[0].CodeForSap;
        this.setLocationTypeCheckboxes(0);
                //(<HTMLInputElement>document.getElementById('ddlCountry')).value = '';
        //this.selectedLocationTypeId = this.locationTypes[0].id;
                //this.locationTypeBitwise = 0;
    }

    setLocationTypeCheckboxes(val){
        this.locationTypeBitwise = val;

        this.locationTypes.forEach(loc => {
            if((val & loc.id) == loc.id){
                let ident = '#locationType' + loc.id;
                jQuery(ident).prop('checked', true);
            } else /*if (val = 0)*/ {
                let ident = '#locationType' + loc.id;
                jQuery(ident).prop('checked', false);
            }
        });
    }

    populateLocationsGrid() {

        if(this.AccountID == 0)
        {
            return;
        }

        this.locationService.getLocationsByAccount(this.AccountID).takeUntil(this.ngUnsubscribe.asObservable())
        .subscribe(
            data => {
                let locations = data.results;
                let locDataSource = [];
                this.locations = locations.ToArray();

                console.log(locations)
                locations.ForEach(element => {
                    locDataSource.push({
                        LocationID: element.LocationID,
                        LocationName: element.LocationName,
                        LocationTypeName: element.LocationTypeName,
                        AddressFull: element.AddressFull,
                        Note: element.Note,
                        LocationTypeId: element.LocationTypeID
                    });
                })
                this.LocationsGridOptions.api.setRowData(locDataSource);
                //this.SelectNodes(this.locations); //Not necessary if we arent "checking" of checkboxes

                //this.populateLocationsGrid();
                //Any other population to put here?
            }
        )
    }

    /*populateCountriesList(_self) {
        var ddlSelectCountry = (<HTMLInputElement>document.getElementById('ddlCountry'));
    
        _self.locationService.getCountryList().takeUntil(this.ngUnsubscribe.asObservable())
        .subscribe(
            data => {
                var resCountries = data.results._elements;
                if (resCountries) {
                    for (var i = 0; i < data.results.Count(); i++) {
                        var elSelect = document.createElement('option');
                        elSelect.value = resCountries[i].CountryID;
                        elSelect.innerText = resCountries[i].CountryName;
                        ddlSelectCountry.appendChild(elSelect);
                    }
                }
            }
        )
    }*/

    onCountryChange(countryId) {
        var ddlState = (<HTMLInputElement>document.getElementById('ddlState'));

        //Delete Old States
        var Existingelements = document.getElementsByClassName("state-select");
        while (Existingelements.length > 0) {
            Existingelements[0].parentNode.removeChild(Existingelements[0]);
        }

        let selectedCountryId = this.countries.find(x => x.CodeForSap == this.selectedCountryCode2).CountryID

        if(countryId < 1){
            selectedCountryId = countryId;
        }

        //let selectedCountryId = this.countries.find(x => x.CodeForSap == this.selectedCountryCode2).CountryID
        console.log(selectedCountryId);

        this.locationService.getStateList(selectedCountryId).takeUntil(this.ngUnsubscribe.asObservable())
        .subscribe(
            data => {
                var resStates = data.results;
                this.states = data.results.ToArray();
                console.log(resStates);
                if (resStates) {
                    data.results.ForEach(element => {
                        var elSelect = document.createElement('option');
                        elSelect.className = "state-select";
                        elSelect.value = element.StateID.toString();
                        elSelect.innerText = element.StateName;
                        ddlState.appendChild(elSelect);
                    })
                }
            }
        )
    }

    validateBillToLocations(){
        let valid = true;
        if((this.locationTypeBitwise & 1) == 1){
            this.locations.forEach(loc => {
                if(loc.LocationID != this.LocationID){
                    if((loc.LocationTypeID & 1) == 1){
                        valid = false;
                    }
                }
            });
        }
        return valid;
    }

    checkIfAccountHasBillTo() {
        let valid = false;

        if(this.locations != null){    
            this.locations.forEach(loc => {
                if (loc.LocationID != this.LocationID) {
                    if ((loc.LocationTypeID & 1) == 1) {
                        valid = true
                    }
                }
            });
        }

        if ((this.locationTypeBitwise & 1) === 1){
             valid = true;
        }

        return valid;
    }

    onLocationNameChange(val){
        if (_.trim(val)){
            jQuery('#locationNameInvalid').css('display', 'none');
        } else{
            jQuery('#locationNameInvalid').css('display', 'block');
        }
    }

    SaveLocationDetails() {
        const locationName = (<HTMLInputElement>document.getElementById('txtLocationName')).value
        const cityVal = (<HTMLInputElement>document.getElementById('txtCity')).value
        const houseNumber = (<HTMLInputElement>document.getElementById('txtHouseNumber')).value
        const streetVal = (<HTMLInputElement>document.getElementById('txtStreet')).value
        if (!_.trim(locationName) || !this.locationTypeBitwise || !_.trim(cityVal) || !_.trim(houseNumber) || !_.trim(streetVal)){
            if (!this.locationTypeBitwise){
                jQuery('#locationTypeInvalid').css('display', 'block');
            }
            if (!_.trim(locationName)){
                jQuery('#locationNameInvalid').css('display', 'block');
            }
            if(!_.trim(cityVal)){
                jQuery('#locationCityInvalid').css('display', 'block');
            }
            if(!_.trim(houseNumber)){
                jQuery('#locationHouseNumberInvalid').css('display', 'block');
            }
            if(!_.trim(streetVal)){
                jQuery('#locationStreetInvalid').css('display', 'block');
            }
            return;
        }
        let locationType = this.locationTypes.filter(x => (x.id & this.locationTypeBitwise) == x.id);        
        let locationTypeExternalIds = [];
        locationType.forEach(loc => {
            locationTypeExternalIds.push(loc.externalId);
        })
        let selectedCountryId = this.countries.find(x => x.CodeForSap == this.selectedCountryCode2).CountryID;
        let selectedStateCode;
        if (this.states){
            let state = this.states.find(x => x.StateID == Number((<HTMLInputElement>document.getElementById('ddlState')).value));
            if (state){
                selectedStateCode = state.StateCode;
            }
        }
        //let country = this.countries.IndexOf
        let location = {
            locationId: this.LocationID,
            accountId: this.AccountID,
            name: (<HTMLInputElement>document.getElementById('txtLocationName')).value,
            addressLine1: (<HTMLInputElement>document.getElementById('txtAddress1')).value,
            //addressLine2: (<HTMLInputElement>document.getElementById('txtAddress2')).value,
            houseNo: (<HTMLInputElement>document.getElementById('txtHouseNumber')).value,
            street: (<HTMLInputElement>document.getElementById('txtStreet')).value,
           // addressLine4: (<HTMLInputElement>document.getElementById('txtAddress4')).value,
            city: (<HTMLInputElement>document.getElementById('txtCity')).value,
            stateId: Number((<HTMLInputElement>document.getElementById('ddlState')).value),
            postalCode: (<HTMLInputElement>document.getElementById('txtPostalCode')).value,
            countryId: selectedCountryId,
            typeId: this.locationTypeBitwise,
            district: (<HTMLInputElement>document.getElementById('txtDistrict')).value,
            Note: (<HTMLTextAreaElement>document.getElementById('txtNotes')).value,
            locationTypeExternalIds: locationTypeExternalIds,
            externalId: this.externalId,
            countryCode2: this.selectedCountryCode2,
            stateCode: this.selectedStateCode
        }
        this.locationService.SaveLocation(location).takeUntil(this.ngUnsubscribe.asObservable()
        )
        .subscribe(
            data => {

                //Close Modal
                (<HTMLInputElement>document.getElementById('btnCloseModal')).click();

                //Repopulate Grid
                this.populateLocationsGrid();

                //Toast success message
                this._notificationsService.success(
                    'Saved!',
                    'Location saved!',
                    {
                        pauseOnHover: false,
                        clickToClose: false
                    }

                )
            }
        );
    }

ngOnDestroy() {
   this.ngUnsubscribe.next();
   this.ngUnsubscribe.complete();
  }

}
