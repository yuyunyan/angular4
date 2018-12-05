import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { CheckShow, MatchOption } from './../../../../_models/bom/checkShow';
import { CommonInput, SearchTermState } from './../../../../_models/bom/commonInput';
import { BOMsService } from './../../../../_services/boms.service';
import { SharedService } from './../../../../_services/shared.service';
import { Manufacturer } from './../../../../_models/Items/manufacturer';
import { FlaggedGridItem } from './../../../../_models/bom/FlaggedGridItem';
import { AccountByObjectType } from './../../../../_models/common/accountByObjectType';
import { BUSY_CONFIG_DEFAULTS , IBusyConfig} from 'angular2-busy';
import { Subscription } from 'rxjs/Subscription';

@Component({
  selector: 'az-bom-search-master',
  templateUrl: './bom-search-master.component.html',
  styleUrls: ['./bom-search-master.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class BomSearchMasterComponent implements OnInit {
  private searchTermState = new SearchTermState();
  private commonInput = new CommonInput();
  private checkShow = new CheckShow();
  private matchOption = new MatchOption();
  private manufacturers: Array<Manufacturer>;
  private flagpartNumberObj: Object;
  private filterPartNumber: string = '';
  private soPartNumber: string;
  private searchId: number;
  private flaggedGridItems = new Array<FlaggedGridItem>();
  //private flagPartNumbers = new Array<number>();
  private bomObjectTypeId: number;
  private bomCommentTypeMap: Array<object>;
  private accountsByObjectType: AccountByObjectType[];
  private bomUploadId:number;
  private bomListId:number;
  private onSearchSubscription: Subscription;

  private busyConfig: IBusyConfig = Object.assign({}, BUSY_CONFIG_DEFAULTS, {
		template: `
			<div style="background: url('../assets/img/loading.svg') no-repeat center 20px; background-size: 72px;">
				<div style="margin-top: 110px; text-align: center; font-size: 18px; font-weight: 700;">
					{{message}}
				</div>
			</div>
		`,
		message: "Searching...",
		minDuration: 1500
	});


  constructor(private bomsService: BOMsService, private route: ActivatedRoute,private sharedService:SharedService ) {
    this.checkShow = new CheckShow();
    this.matchOption = new MatchOption();
    this.manufacturers = new Array<Manufacturer>();
    this.accountsByObjectType = new Array<AccountByObjectType>();
    this.searchId = 0;
    this.bomsService.GetManufacturers().subscribe(data => {
      this.manufacturers = data;
    });
    this.sharedService.getAccountsByObjectType().subscribe(data=>{
       this.accountsByObjectType = data;
    })
    this.bomsService.getBOMObjectTypeId().subscribe(data => {
      this.bomObjectTypeId = data;
    });
    this.bomsService.getBOMCommentTypeId().subscribe((commentTypeMap) => {
      this.bomCommentTypeMap = commentTypeMap;
    });
  }

  ngOnInit() {
    this.route.params.subscribe(params => {
      if (!isNaN(+params['bomListId'])) {
        this.searchTermState.bomListId = +params['bomListId'];
        this.searchTermState.searchTypeValue = 'B';
        this.bomListId =  +params['bomListId'];
      }
    });

    this.searchTermState.startDate = this.addMonths(new Date(), -6);
    this.searchTermState.endDate = new Date();
    this.searchTermState.startDateFormat = this.convertDate(this.searchTermState.startDate);
    this.searchTermState.endDateFormat = this.convertDate(this.searchTermState.endDate);
  }

  onFilterPartNoChange(e) {
    this.filterPartNumber = e;
  }

  partNumberFlagChanged(flaggedItem: FlaggedGridItem) {
    
    let flaggedItemIndex = this.flaggedGridItems.findIndex(x => x.partNumber == flaggedItem.partNumber && x.manufacturer == flaggedItem.manufacturer);
    if (flaggedItemIndex > -1) {
      this.flaggedGridItems.splice(flaggedItemIndex, 1);
    } else {
      this.flaggedGridItems.push(flaggedItem);
    }
    
    this.flaggedGridItems = this.flaggedGridItems.map(x => x);
  }

  //Get the date in the past 6 months
  addMonths(date, months) {
    date.setMonth(date.getMonth() + months);
    return date;
  }
  convertDate(date) {
    var yyyy = date.getFullYear().toString();
    var mm = (date.getMonth() + 1).toString();
    var dd = date.getDate().toString();
    var mmChars = mm.split('');
    var ddChars = dd.split('');
    return yyyy + '-' + (mmChars[1] ? mm : "0" + mmChars[0]) + '-' + (ddChars[1] ? dd : "0" + ddChars[0]);
  }

  selectAll(e) {
    if (e.target.checked == true) {
      Object.keys(this.checkShow).forEach(key => {
        this.checkShow[key] = true;
      })
    }else {
      Object.keys(this.checkShow).forEach(key => {
        this.checkShow[key] = false;
      })
    }
  }
  onSelectChange(e){
    if(e=="P" || e=="X"){
      this.searchTermState.bomListId =null;
     
    }
  }



  accountOptionChange(value) {
    this.searchTermState.accountOptionValue = value;
  }
  formatDate(date) {
    var d = new Date(date),
      month = '' + (d.getMonth() + 1),
      day = '' + d.getDate(),
      year = d.getFullYear();

    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;

    return [year, month, day].join('-');
  }

  searchClick() {
    let tempCommonInput = new CommonInput();
    //this.commonInput= JSON.parse(JSON.stringify(this.searchTermState));
    Object.keys(this.commonInput).forEach(key => {
      tempCommonInput[key] = this.searchTermState[key];
    });
    this.commonInput = tempCommonInput;

    Object.keys(this.checkShow).forEach(key => {
      this.matchOption[key] = this.checkShow[key];
    })
    this.commonInput.partNumbers = this.commonInput.partNumber.split(/[\r\n,;\s]+/);
     this.onSearchSubscription= this.bomsService.processMatch(this.commonInput,this.matchOption
     ).subscribe(data=>{
        this.searchId = data;
        this.flaggedGridItems = new Array<FlaggedGridItem>();   
      })
   this.busyConfig.busy = this.onSearchSubscription;

  }

  onSaveBOMSuccess(itemListId: number) {
    this.searchTermState.bomListId = itemListId;
    this.bomUploadId = itemListId;
    this.searchTermState.searchTypeValue = 'B';
  }

  onCloseUploadModal() {
    jQuery('#mdlUploadBOM').modal('toggle');
  }

  onCloseItemsFlagged() {
    jQuery('#mdlItemsFlagged').modal('toggle');
  }

  onSaveItemsFlaggedSuccess() {

  }


}
