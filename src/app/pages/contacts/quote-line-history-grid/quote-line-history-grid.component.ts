import { Component, OnInit,Input,SimpleChanges } from '@angular/core';
import {GridOptions} from 'ag-grid';
import { QuoteService} from './../../../_services/quotes.service';
import { GPUtilities } from '../../../_utilities/gp-utilities/gp-utilities';
import { LinkCreator } from './../../../_utilities/linkCreaator';
import { Router, ActivatedRoute, Params } from '@angular/router';
import * as _ from 'lodash';

@Component({
  selector: 'az-quote-line-history-grid',
  templateUrl: './quote-line-history-grid.component.html',
  styleUrls: ['./quote-line-history-grid.component.scss']
})
export class QuoteLineHistoryGridComponent implements OnInit {
  private quotesGrid:GridOptions;
  private rowDataSet = [];
  @Input() accountId: number;
  @Input() contactId: number;


  constructor(private router: Router,private linkCreator: LinkCreator,private quoteService:QuoteService,private gpUtilities: GPUtilities) { 
    this.quotesGrid={
      pagination: true,
      enableSorting:true,
      enableColResize:true,
      rowSelection: 'multiple',
      paginationPageSize: 25,
      toolPanelSuppressSideButtons: true,
      suppressContextMenu:true,
      defaultColDef: { suppressMenu: true }
    };
  }

  ngOnChanges(changes: SimpleChanges){
  }

  ngOnInit() {
   this.populateQuoteLineData();
  }

  refreshGrid(){
    this.populateQuoteLineData();
  }

  ngAfterViewInit(): void {
    jQuery(".quoteHistoryGrid .quotePartsButton").appendTo(".quoteHistoryGrid .ag-paging-panel");
  }

  populateQuoteLineData(){
    const _self= this;
    this.quoteService.getQuoteLineByAccountId(this.accountId,this.contactId).subscribe(
      data=>{
        _self.createQuoteLineGrid();
        _self.populateQuoteLineGrid(data);       
      }
    )
  }

  populateQuoteLineGrid(quoteLines){
    const _self= this;
    _self.rowDataSet= _.map(quoteLines,quoteLine=> _self.createQuoteLineRow(quoteLine));
    _self.quotesGrid.api.setRowData(_self.rowDataSet);
    _self.quotesGrid.api.sizeColumnsToFit();    
  }

  createQuoteLineRow(quoteLine){
    let gpm =0;
    if(quoteLine.price !=0){
      gpm=(quoteLine.price- quoteLine.cost) / quoteLine.price;
    };
    let row={
      contactName:quoteLine.contact,
      quoteId:quoteLine.quoteId,
      quoteLn:quoteLine.quoteId + "-" + quoteLine.lineNum,
      versionId:quoteLine.versionId,
      status:quoteLine.status,
      quoteDate:quoteLine.quoteDate,
      partNumber:quoteLine.partNumber,
      itemId:quoteLine.itemId,
      manufacturer:quoteLine.manufacturer,
      qty:quoteLine.qty,
      price:quoteLine.price.toFixed(2),
      cost:quoteLine.cost.toFixed(2),
      gpm:!isNaN(gpm) ? (gpm *100).toFixed(2)+ '%' :'',
      dateCode:quoteLine.dateCode,
      packaging:quoteLine.packaging,
      owner:quoteLine.owners
    }
    return row;
  }

  createLink(text, clickEvent) {
    var anchor = document.createElement('a');
    anchor.text = text;
    anchor.href = "javascript:void(0)";
    anchor.addEventListener("click", clickEvent);
    return anchor;
  }

  orderIdLinkClicked(quoteId, versionId) {
    return () => this.router.navigate(['pages/quotes/quote-details', { quoteId: quoteId, quoteVersionId: versionId}]);
  }

  floatColComparator(valueA, valueB){
    if (!valueA) {
      return 0;
    }
    return parseFloat(valueA) - parseFloat(valueB);
  }

  createQuoteLineGrid(){
    const _self = this;
    let columnDefs= [
      {
        headerName: "Quote-LN",
        field: "quoteLn",
        headerClass: "grid-header",
        cellRenderer: function (params) {
          return _self.createLink(params.data.quoteLn, _self.orderIdLinkClicked(params.data.quoteId, params.data.versionId))
        },
        width:110
      },
      {
        headerName: "Contact Name",
        field: "contactName",
        headerClass: "grid-header",
        hide:this.contactId?true:false
      },
      {
        headerName: "Status",
        field: "status",
        headerClass: "grid-header"
      },
      {
        headerName: "Quote Date",
        field: "quoteDate",
        headerClass: "grid-header"
      },
      {
        headerName: "Part Number",
        field: "partNumber",
        headerClass: "grid-header",
        cellRenderer: (params) => {
          if(!params.node.data.itemId){
            return params.node.data.partNumber;
          }else{
          return this.linkCreator.createItemLink(params.node.data.itemId, params.node.data.partNumber)
          }
        },
      },
      {
        headerName: "Manufacturer",
        field: "manufacturer",
        headerClass: "grid-header"
      },
      {
        headerName: "Qty",
        field: "qty",
        headerClass: "grid-header",
        width:90
      },
      {
        headerName: "Price",
        field: "price",
        headerClass: "grid-header",
        comparator: _self.floatColComparator,
        width:90
      },
      {
        headerName: "Cost",
        field: "cost",
        headerClass: "grid-header",
        comparator: _self.floatColComparator,
        width:90
      },
      {
        headerName: "GP(%)",
        field: "gpm",
        headerClass: "grid-header",
        width:80
      },
      {
        headerName: "GP(USD)",
        headerClass: "grid-header",
        comparator: _self.floatColComparator,
        valueGetter:function(params){
          if(params.data){
            if((params.data.qty * params.data.price) == 0){
              return "";
            }
            let val = _self.gpUtilities.GrossProfit(params.data.qty, params.data.cost, params.data.price);
            return val;
          }}
      },
      {
        headerName: "Date Code",
        field: "dateCode",
        headerClass: "grid-header"
      },
      {
        headerName: "Packaging",
        field: "packaging",
        headerClass: "grid-header"
      },
      {
        headerName: "Owner",
        field: "owner",
        headerClass: "grid-header"
      }
     
    ]
    this.quotesGrid.api.setColumnDefs(columnDefs);
  }

}
