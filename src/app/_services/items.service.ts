import { Injectable } from '@angular/core';
import { HttpService } from './httpService';
import { Observable } from 'rxjs/Observable';
import { List } from 'linqts';
import { Response } from '@angular/http';
import { Item } from './../_models/Items/item';
import { InventoryDetails } from './../_models/Items/inventoryDetails';
import { ItemAvailability } from './../_models/Items/ItemAvailability';
import { ItemSalesOrders } from './../_models/Items/itemSalesOrders';
import { ItemQuotes } from '../_models/Items/itemQuotes';
import { ItemDetails } from './../_models/Items/itemdetails';
import { ItemTechnicalDetails } from './../_models/Items/itemTechnicalDetails';
import { Manufacturer } from './../_models/Items/manufacturer';
import { ItemStatus } from './../_models/Items/itemstatus';
import { ItemGroup } from './../_models/Items/itemgroup';
import { ItemCommodity } from './../_models/Items/itemCommodity';
import { ItemExtra} from './../_models/Items/itemExtra';
import { PurchcaseOrderPartSearch } from '../_models/Items/PurchcaseOrderPartSearch';
import { PoSoUtilities } from './../_utilities/po-so-utilities/po-so-utilities';

@Injectable()
export class ItemsService {
    constructor(private httpService: HttpService, private sopoUtilities: PoSoUtilities) {
    }

    GetItemsListForGrid(SearchString: string, RowOffset: number, RowLimit: number, SortCol: string, DescSort: boolean) {
        let url = 'api/items/getItemsList?SearchString=' + SearchString + '&RowOffset=' + RowOffset + '&RowLimit=' + RowLimit + '&SortCol=' + SortCol + '&DescSort=' + DescSort;
        return this.httpService.Get(url).map(

            data => {
                let res = data.json();
                var items = new List<Item>();
                res.items.forEach(element => {

                    let con = new Item();
                    con.ItemID = element.itemId;
                    con.ManufacturerName = element.manufacturerName;
                    con.ManufacturerPartNumber = element.manufacturerPartNumber;
                    con.CommodityName = element.commodityName;
                    con.Status = element.status;
                    con.Description = element.description;
                    items.Add(con);
                })

                return { results: items, totalRowCount: res.totalRowCount, error: null };
            }, error => {
                console.log("Items list service call failed");
            })

    }

    GetItemAvailability(itemId: number, RowOffset: number, RowLimit: number, SortCol: string, DescSort: boolean) {
        let url = 'api/items/getItemAvailability?itemId=' + itemId + '&RowOffset=' + RowOffset + '&RowLimit=' + RowLimit + '&SortCol=' + SortCol + '&DescSort=' + DescSort;
        return this.httpService.Get(url).map(
            data => {
                let res = data.json();
                var items = new List<ItemAvailability>();
                res.items.forEach(element => {
                    let con = new ItemAvailability();
                    con.sourceId = element.sourceId;
                    con.accountId = element.accountId;
                    con.accountName = element.accountName;
                    con.typeName = element.typeName;
                    con.created = element.created;
                    con.createdBy = element.createdBy;
                    con.dateCode = element.dateCode;
                    con.quantity = element.quantity;
                    con.rating = element.rating == 0? '': element.rating;
                    con.cost = element.cost? parseFloat(element.cost.toString()).toFixed(2) : '';
                    con.rtpQty = element.rtpQty;
                    con.packagingId = element.packagingId;
                    con.packagingName = element.packagingName;
                    con.moq = element.moq;
                    con.leadTime = element.leadTime;
                    con.externalId = element.externalId;
                    items.Add(con);
                })

                return { results: items, totalRowCount: res.totalRowCount, error: null };
            }, error => {
                console.log("Items availability service call failed");
            })
    }
    
    GetItemQuotes(itemId: number, RowOffset: number, RowLimit: number, SortCol: string, DescSort: boolean) {
        let url = 'api/items/getItemQuotes?itemId=' + itemId + '&RowOffset=' + RowOffset + '&RowLimit=' + RowLimit + '&SortCol=' + SortCol + '&DescSort=' + DescSort;
        var self = this;
        return this.httpService.Get(url).map(
            data => {
                let res = data.json();
                var items = new List<ItemQuotes>();
                res.items.forEach(element => {
                    let con = new ItemQuotes();
                    var sentDateFormatted = self.sopoUtilities.ParseDateFromDateTime(element.sentDate); //Remove time from datetime stamp
                    var ownersFormatted = self.sopoUtilities.RemoveTrailingCommaAndSpace(element.owners); //Remove trailing commma and space
                    con.quoteId = element.quoteId;
                    con.quoteLineId = element.quoteLineId;
                    con.versionId = element.versionId;
                    con.accountId = element.accountId;
                    con.accountName = element.accountName;
                    con.dateCode = element.dateCode;
                    con.firstName = element.firstName;
                    con.lastName = element.lastName;
                    con.contactId = element.contactId;
                    con.organizationId = element.organizationId;
                    con.orgName = element.orgName;
                    con.statusId = element.statusId;
                    con.statusName = element.statusName;
                    con.sentDate = sentDateFormatted;
                    con.quantity = element.quantity;
                    con.cost = element.cost;
                    con.price = element.price;
                    con.packagingId = element.packagingId;
                    con.packagingName = element.packagingName;
                    con.gpm = element.gpm;
                    con.owners = ownersFormatted;
                    items.Add(con);
                })

                return { results: items, totalRowCount: res.totalRowCount, error: null };
            }, error => {
                console.log("Items quotes service call failed");
            })
    }
    ItemSalesOrders(itemId: number, RowOffset: number, RowLimit: number, SortCol: string, DescSort: boolean) {
        let url = 'api/items/getItemSalesOrders?itemId=' + itemId + '&RowOffset=' + RowOffset + '&RowLimit=' + RowLimit + '&SortCol=' + SortCol + '&DescSort=' + DescSort;
        var self = this;
        return this.httpService.Get(url).map(
            data => {
                let res = data.json();
                var items = new List<ItemSalesOrders>();
                res.items.forEach(element => {

                    let con = new ItemSalesOrders();
                    var ownersFormatted = self.sopoUtilities.RemoveTrailingCommaAndSpace(element.owners); //Remove trailing commma and space
                    var shipDateFormatted = self.sopoUtilities.ParseDateFromDateTime(element.shipDate);
                    var trimmedPrice = self.sopoUtilities.TrimFloat(element.price);
                    var trimmedCost = self.sopoUtilities.TrimFloat(element.cost);
                    
                    con.soLineId = element.soLineId;
                    con.salesOrderId = element.salesOrderId;
                    con.versionId = element.versionId;
                    con.accountName = element.accountName;
                    con.accountId = element.accountId;
                    con.contactId = element.contactId;
                    con.firstName = element.firstName;
                    con.lastName = element.lastName;
                    con.orgName = element.orgName;
                    con.orderDate = element.orderDate;
                    con.shipDate = shipDateFormatted;
                    con.dateCode = element.dateCode;
                    con.quantity = element.quantity;
                    con.price = trimmedPrice;
                    con.cost = trimmedCost;
                    con.packagingId = element.packagingId;
                    con.packagingName = element.packagingName;
                    con.packageConditionId = element.packageConditionId;
                    con.conditionName = element.conditionName;
                    con.owners = ownersFormatted;
                    con.soExternalId = element.soExternalId;
                    items.Add(con);
                })

                return { results: items, totalRowCount: res.totalRowCount, error: null };
            }, error => {
                console.log("Items sales orders service call failed");
            })
    }


    GetItemInventory(itemId: number,ExcludePo:boolean, RowOffset: number, RowLimit: number, SortCol: string, DescSort: boolean) {
        let url = 'api/items/getItemInventory?itemId=' + itemId +'&ExcludePo=' + ExcludePo +'&RowOffset=' + RowOffset + '&RowLimit=' + RowLimit + '&SortCol=' + SortCol + '&DescSort=' + DescSort;
        var self = this;
        return this.httpService.Get(url).map(

            data => {
                let res = data.json();
                var inventory = new List<InventoryDetails>();
                res.items.forEach(element => {
                    let con = new InventoryDetails();
                    var shipDateFormatted = self.sopoUtilities.ParseDateFromDateTime(element.shipDate);
                    var costFormatted = self.sopoUtilities.TrimFloat(element.cost);
                    var buyerFormatted =  self.sopoUtilities.RemoveTrailingCommaAndSpace(element.buyer);
                    con.warehouseId = element.warehouseId;
                    con.warehouseName = element.warehouseName;
                    con.accountId = element.accountId;
                    con.accountName = element.accountName;
                    con.origQty = element.origQty;
                    con.availableQty = element.availableQty;
                    con.purchaseOrderId = element.purchaseOrderId;
                    con.poVersionId = element.poVersionId;
                    con.externalId = element.poExternalId;
                    con.buyers = buyerFormatted;
                    con.cost = costFormatted;
                    con.allocated = element.allocated;
                    con.dateCode = element.dateCode;
                    con.packagingName = element.packagingName;
                    con.packageCondition = element.packageCondition
                    con.shipDate = shipDateFormatted;
                    inventory.Add(con);
                })
                return { results: inventory, totalRowCount: res.totalRowCount, error: null };
            }, error => {
                console.log("Item inventory list service call failed");
            })
    }

    GetAllItems() {
        let url = 'api/items/getItems';
        return this.httpService.Get(url).map(

            data => {
                let res = data.json();
                let items = res.items.map(element => {

                    let con = new Item();
                    con.ItemID = element.itemId;
                    con.ManufacturerPartNumber = element.partNumber;
                    return con;
                });
                return items;
                
            }, error => {
                console.log("Items list call failed");
            })

    }

    GetItemDetails(ItemID: number) {
        let url = 'api/items/getItemDetails?ItemID=' + ItemID;
        return this.httpService.Get(url).map(
            data => {
                let res = data.json();
                var details = new ItemDetails();
                details.ItemID = res.itemId;
                details.ManufacturerID = res.manufacturerId;
                details.MPN = res.manufacturerPartNumber;
                details.CommodityID = res.commodityId;
                details.CommodityName = res.commodityName;
                details.Description = res.description;
                details.ECCN = res.eccn;
                details.GroupID = res.groupId;
                details.GroupName = res.groupName;
                details.ManufacturerName = res.manufacturerName
                details.StatusID = res.statusId;
                details.HTS = res.hts;
                details.MSL = res.msl;
                details.Length = res.length;
                details.Width = res.width;
                details.Depth = res.depth;
                details.Weight = res.weight;

                switch (res.eurohs) {
                    case false:
                        details.EUROHS = 0;
                        break;
                    case true:
                        details.EUROHS = 1;
                        break;
                }

                switch (res.cnrohs) {
                    case false:
                        details.CNROHS = 0;
                        break;
                    case true:
                        details.CNROHS = 1;
                        break;
                }
                
                return {results: details};
            },
            error => {
                console.log('Item details service call failed');
            }
        )
    }
    GetItemStatusList() {
        let url = 'api/items/getItemStatuses'
        return this.httpService.Get(url).map(
            data => {
                let res = data.json();
                var statuses = new Array<ItemStatus>();
                res.forEach(element => {

                    let status = new ItemStatus();
                    status.ItemStatusID = element.ItemStatusID;
                    status.StatusName = element.StatusName;
                    statuses.push(status);
                })
                return { results: statuses, error: null };
            },
            error => {
                console.log('Item Status List service call failed');
            }
        )
    }

    GetItemPurchaseOrdersList(itemId: number, RowOffset: number, RowLimit: number, SortBy: string, DescSort: boolean) {
            let url = 'api/items/getItemPurchaseOrders?itemId=' + itemId + '&RowOffset=' + RowOffset + '&RowLimit=' + RowLimit + '&SortBy=' + SortBy + '&DescSort=' + DescSort;
            return this.httpService.Get(url).map(
                data => {
                    const self = this;
                    let res = data.json();
                    var items = res.items.map(element => {
                        var ownersFormatted = self.sopoUtilities.RemoveTrailingCommaAndSpace(element.owners); //Remove trailing commma and space
                        let con = new PurchcaseOrderPartSearch();
                        con.pOLineId = element.pOLineId;
                        con.purchaseOrderId = element.purchaseOrderId;
                        con.versionId = element.versionId;
                        con.poExternalId = element.poExternalId;
                        con.accountId = element.accountId;
                        con.accountName = element.accountName;
                        con.contactId = element.contactId;
                        con.firstName = element.firstName;
                        con.lastName = element.lastName;
                        con.organizationId = element.organizationId;
                        con.orgName = element.orgName;
                        con.statusId = element.statusId;
                        con.statusName = element.statusName;
                        con.orderDate = element.orderDate;
                        con.dueDate = element.dueDate;
                        con.qty = element.qty;
                        con.cost = element.cost;
                        con.dateCode = element.dateCode;
                        con.packagingId = element.packagingId;
                        con.packagingName = element.packagingName;
                        con.packageConditionId = element.packageConditionId;
                        con.conditionName = element.conditionName;
                        con.owners = ownersFormatted;
                        con.warehouseId = element.warehouseId;
                        con.warehouseName = element.warehouseName;
                        return con;
                    }) 
                    return { results: items, totalRowCount: res.totalRowCount, error: null };
                }, error => {
                    console.log("Items quotes service call failed");
                })      
    }

    GetItemTechnicalDetails(itemId: number) {
        let url = 'api/items/getTechnicalData?itemId=' + itemId;
        return this.httpService.Get(url).map(
            data => {
                let res = data.json();
                var details = new Array<ItemTechnicalDetails>();
                res.technicalData.forEach(element => {
                    let detail = new ItemTechnicalDetails();
                    detail.key = element.key;
                    detail.value = element.value;
                    details.push(detail);
                })
                return { results: details, error: null };
            },
            error => {
                console.log('Item Technical Details List service call failed');
            }
        )
    }

    GetItemGroupList() {
        let url = 'api/items/getItemGroupList'
        return this.httpService.Get(url).map(
            data => {
                let res = data.json();
                var groups = new Array<ItemGroup>();
                res.itemGroups.forEach(element => {
                    let group = new ItemGroup();
                    group.ItemGroupID = element.itemGroupId;
                    group.GroupName = element.groupName;
                    groups.push(group);
                })
                return { results: groups, error: null };
            },
            error => {
                console.log('Item Group List service call failed');
            }
        )
    }

    GetCommodities() {
        let url = 'api/items/getItemCommodityList'
        return this.httpService.Get(url).map(
            data => {
                let res = data.json();

                var coms = new Array<ItemCommodity>();
                res.commodities.forEach(element => {

                    let com = new ItemCommodity();
                    com.CommodityID = element.commodityId;
                    com.CommodityName = element.commodityName;
                    com.ItemGroupID = element.itemGroupId;
                    coms.push(com);
                })
                return { results: coms, error: null };
            },
            error => {
                console.log('Item Commodity List service call failed');
            }
        )
    }

    GetManufacturers() {
        let url = 'api/items/getManufacturersList?searchText='
        return this.httpService.Get(url).map(
            data => {
                let res = data.json();

                var mfrs = new Array<Manufacturer>();
                res.manufacturers.forEach(element => {
                
                let mfr = new Manufacturer();
                mfr.MfrID = element.mfrId;
                mfr.MfrName = element.mfrName;
                mfr.Code = element.code;
                mfr.MfrURL = element.mfrUrl
                mfrs.push(mfr);
            })
                return {manufacturers: mfrs, error: null };
            },
            error => {
                console.log('Manufacturers service call failed');
            }
        )
    }

    CreateManufacturer(body:any){
        console.log(body);
        let url = 'api/items/createManufacturer';
        return this.httpService.Post(url,body);
    }

    GetItemExtras() {
        let url = 'api/items/getItemExtraList';
        return this.httpService.Get(url).map(
            data => {
                let res = data.json();

                var itemExtras = new Array<ItemExtra>();

                res.itemExtras.forEach(element => {
                    let itemExtra = new ItemExtra();
                    itemExtra.itemExtraId = element.itemExtraId;
                    itemExtra.extraName = element.extraName;
                    itemExtra.extraDescritpion = element.extraDescritpion;
                    itemExtras.push(itemExtra);
                })

                return { itemExtras: itemExtras, error: null };
            },
            error => {
                console.log('ItemExtras service call failed');
            }
        )
    }

    SaveItemDetails(item: any) {
        let url = 'api/items/setItemDetails';
        let body = {
                itemId: item.ItemID,
                mpn: item.MPN,
                commodityId: item.CommodityID,
                description: item.Description,
                eccn: item.ECCN,
                eurohs: (item.EUROHS == "1") ? true : false,
                cnrohs: (item.CNROHS == "1") ? true : false,
                groupId: item.GroupID,
                manufacturerID: item.ManufacturerID,
                statusId: item.StatusID,
                hts: item.HTS,
                msl: item.MSL,
                length: item.Length,
                width: item.Width,
                depth: item.Depth,
                weight: item.Weight,
                isDeleted: item.isDeleted
        }
        return this.httpService.Post(url, body)
    }

    DeleteItem(itemId: number){
        let url = 'api/items/deleteItem?itemId='+itemId;
        return this.httpService.Post(url,itemId).map(
            data => {
                let res = data.json();
            })
    }

    syncItem(itemId: number){
        let url = 'api/items/sync?itemId='+itemId;
            return this.httpService.Post(url,{}).map(
                data => {
                    let res = data.json();
                    return {transactionId:res.transactionId, errorMessage:res.errorMessage};
                },
                error => { return error.json(); }
            )
   }
    /*getLocationDetails(LocationID: number) {
        let url = 'api/account/getLocationDetails?locationId=' + LocationID;
        return this.httpService.Get(url);
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
                    loc.AddressFull = element.houseNo + ' ' + element.street + ', ' + element.city + ', ' + element.formattedState + ' ' + element.postalCode;
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
        }
        return this.httpService.Post(url, body);

    } */
}
