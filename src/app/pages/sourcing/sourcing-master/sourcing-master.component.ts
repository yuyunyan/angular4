import { SharedComponentModule } from './../../_sharedComponent/sharedComponent.module';
import { SourcingPartsComponent } from './../sourcing-parts/sourcing-parts.component';
import { Component, OnInit, OnDestroy,  ViewChild ,ViewEncapsulation , Input , SimpleChanges , EventEmitter, Output } from '@angular/core';
import { NotificationsService } from 'angular2-notifications';
import { SourcingRouteStatus } from './../../../_models/sourcing/sourcingStatuses';
import { PartSourcesComponent } from './../../_sharedComponent/part-sources/part-sources.component';
import { SourcingRfqsComponent } from './../../_sharedComponent/sourcing-rfqs/sourcing-rfqs.component';
import { QuoteService } from './../../../_services/quotes.service';
import { QuotePart } from './../../../_models/quotes/quotePart';
import { SourcingService } from './../../../_services/sourcing.service';
import { SharedService } from './../../../_services/shared.service';
import { SourceService } from '../source.service';
import { CommentsService } from './../../../_services/comments.service';
import { Observable } from 'rxjs';
import { Subject } from 'rxjs/Subject';
import * as _ from 'lodash';
import { SourcesDialogComponent } from './../sources-dialog/sources-dialog.component';

@Component({
  selector: 'az-sourcing-master',
  templateUrl: './sourcing-master.component.html',
  styleUrls: ['./sourcing-master.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [SourceService]
})
export class SourcingMasterComponent implements OnInit {
  @ViewChild(PartSourcesComponent)
  private sourcesGridChanges: PartSourcesComponent;

  @ViewChild(SourcesDialogComponent)
  private sourcesDialogComponent: SourcesDialogComponent;

  @ViewChild(SourcingRfqsComponent)
  private rfqGridChanges: SourcingRfqsComponent;
  @Output() onNewSourceButtonClicked: EventEmitter<any> = new EventEmitter();

  private partNumber;
  private partNumberStrip;
  private newRfq:number;
  private quoteLineId;
  private tabIndex : number;
  private quotePartObjectTypeId: number;
  private quotePart : {};
  private selectedQuoteLineId: number;
  private salesNotifyOptions = {
    position: ['top', 'right'],
    timeOut: 2000,
    pauseOnHover: true,
    lastOnBottom: true
  };
  private otherBuyerTitle: string = '';
  private partObject;
  private routeStatuses$: Observable<SourcingRouteStatus[]>;
  private routeToStatusObject;
  private selectedQuoteObjectInfo: string;
  private selectedSourceObjectInfo: string;
  private selectedSourceId: number;
  private sourceObjectTypeId: number;
  private sourcesJoinObjectTypeId: number;

  private sourcesJoinCommentUId: number;

  private searchParamter: string = '';

  private selectedRows;

  private ngUnsubscribe: Subject<void> = new Subject<void>();

  constructor(private quoteService: QuoteService, private sourcingService: SourcingService,private sharedService : SharedService,
    private commentsService: CommentsService, private _notificationsService: NotificationsService, private sourceService : SourceService) {
    this.quoteService.getQuotePartObjectTypeId().subscribe((objectTypeId) => {
      this.quotePartObjectTypeId = objectTypeId;
    });
    this.sourcingService.getSourceObjectTypeId().subscribe((objectTypeId) => {
      this.sourceObjectTypeId = objectTypeId;
    });
    this.sourcingService.getSourcesJoinObjectTypeId().subscribe((objectTypeId) => {
      this.sourcesJoinObjectTypeId = objectTypeId;
    });

    sourceService.sourcingStatus$.subscribe(
      status => {
      let sourceStatus = this.quotePart["statusId"];
      });

    this.routeStatuses$ = this.sourcingService.getRouteStatuses().map(data => data['routeStatuses']);
  }

  ngOnInit() {
    this.quoteLineId = null;
    this.partNumber = null;
    this.partNumberStrip = null;
  }

  onBtnClicked(){
    this.sourcesDialogComponent.openNewSourceModal();    
  }
  
  contentChanged(e) {
    this.quoteLineId = e.quoteLineId;
    this.partNumber = e.partNumber;
    this.partNumberStrip = e.partNumberStrip;
    this.tabIndex = e.tabIndex;
    this.selectedSourceId = undefined;
    this.selectedSourceObjectInfo = undefined;
    this.sourcesJoinCommentUId = undefined;
    this.partObject = _.assign({}, {
      partNumber: e.partNumber,
      mfr: e.mfr,
      commodityId: e.commodityId,
      itemId: e.itemId
    });
    this.updateBuyerTitle();
  }

  updateBuyerTitle(){
    const _self = this;
    _self.otherBuyerTitle = 'Routed To: \n';
    _self.sourcingService.getQuoteLineBuyers(_self.quoteLineId)
      .takeUntil(this.ngUnsubscribe.asObservable())  
      .subscribe(data => {
        _.forEach(data.buyerNames, buyer => {
          _self.otherBuyerTitle += ("\t" + buyer + "\n");
        });
    });
  }

  sourceAdded(e) {
    this.partNumber = e.val;
  }

  tabClicked(){
    this.sourcesGridChanges.resetGridColumns_Click(); 
  }

  RfqtabClicked(){
    this.rfqGridChanges.resetGridColumns_Click();
  }

  rfqAdded(e){
    this.newRfq = e.rfqAdded;
  }

  onQuotePartCommentSaved(){
    this.sourcingService.partCommentIncrement();
  }

  updateQuoteStatus(rs: SourcingRouteStatus){
    const _self = this;
    const payload = {
      routeStatusId: rs.routeStatusId,
      quoteLines: [{quoteLineId: _self.quoteLineId}]
    };
    _self.sourcingService.setBuyerRoute(payload)
      .takeUntil(this.ngUnsubscribe.asObservable())    
      .subscribe(data => {
      if (data && data.isSuccess){
        _self.routeToStatusObject = {
          routeStatusReload: true
        };
      }
    });
  }

  refreshGrid(){
  }

  onSourceCommentSaved(){
    this.sourcingService.sourceCommentIncrement();
  }

  onSelectedQuoteLineId(e){
    this.selectedQuoteLineId = e;
    this.searchParamter = '';
    this.getSourcesJoinCommentUId();
  }

  onSelectedQuoteObjectInfo(e){
    this.selectedQuoteObjectInfo = e;
  }

  onSelectedSourceId(e){
    this.selectedSourceId = e;
    this.searchParamter = '';
    this.getSourcesJoinCommentUId();
  }

  onSelectedSourceObjectInfo(e){
    
    this.selectedSourceObjectInfo = e;
  }

  onSelectedRows(e){
    this.selectedRows = null;
    this.selectedRows = e;
  }
  onSubmitToSales(e){
    this.quotePart = e;
  }
 

  getSourcesJoinCommentUId(){
    const _self = this;
    if (_self.selectedQuoteLineId && _self.selectedSourceId && _self.quotePartObjectTypeId) {
      _self.sourcingService.getSourcesJoinCommentUId(_self.selectedQuoteLineId, _self.quotePartObjectTypeId, _self.selectedSourceId).subscribe(
        data => {
          _self.sourcesJoinCommentUId = data > 0 ? data : undefined;
        }
      )
    }
  }

}
