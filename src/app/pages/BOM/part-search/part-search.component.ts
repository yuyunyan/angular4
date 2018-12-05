
import { Component, OnInit, Input } from '@angular/core';
import { GridOptions } from 'ag-grid';
import { BOMsService } from './../../../_services/boms.service';
import { FormGroup, FormControl, AbstractControl, FormBuilder, Validators} from '@angular/forms';
import { Router} from '@angular/router';

@Component({
  selector: 'az-part-search',
  templateUrl: './part-search.component.html',
  styleUrls: ['./part-search.component.scss']
})
export class PartSearchComponent implements OnInit {
  private partSearchGrid: GridOptions;
  private searchParameter: string = '';
  private searchType: string = 'StartsWith';
  private selectedParts = [];
  private showMasterGrid: boolean;
  private itemId: string;
  private partSearched:boolean = true;
  private showErrorMessage:boolean;
  public form:FormGroup;
  public inputText:AbstractControl;
  public searchBtn:AbstractControl;
  public errorMessage:AbstractControl;
  private noPartSelected: boolean;

  constructor(private bomService: BOMsService,fb:FormBuilder,private router:Router) {
    this.partSearchGrid = {
      pagination: true,
      rowSelection: 'multiple',
      paginationPageSize: 25,
      toolPanelSuppressSideButtons: true,
      suppressContextMenu:true,
      defaultColDef: { suppressMenu: true },
      columnDefs: this.createPartGrid()
    }

    this.form= fb.group({
      inputText: ['', Validators.compose([Validators.required])]
    });
    this.inputText= this.form.controls['inputText'];
  }

  ngOnInit() {
  
  }

  OpenQuoteModal(){
    this.selectedParts = this.partSearchGrid.api.getSelectedRows();
    if(this.selectedParts && this.selectedParts.length > 0){
      this.noPartSelected = false;
      jQuery("#mdlCreateQuote").show();
    }else{
      this.noPartSelected = true;
    }
  }

  searchParts() { 
    if(this.form.valid){
      this.showErrorMessage=false;
      this.showMasterGrid = true;
      this.populateGrid();
    }else{
      this.showErrorMessage=true;
    }  
  }

  partSelectChange(e) {
    if(this.form.valid){
      this.searchType = e.target.value;
      this.populateGrid();
      this.itemId = '';
    }
  }

  createPartGrid() {
    let _self = this;
    return [
      {
        headerName: "",
        field: "expander",
        width: 50,
        cellRenderer: function (params) { return _self.createClickIcon(params.data.avaliable, _self.avaliableClicked(params.data.itemId)) }
      },
      {
        headerName: "Manufacturer Part Number",
        field: "manPartNo",
        headerClass: "grid-header",
        width: 175,
        cellRenderer: function(params){return _self.createPartNoLink(params.data.manPartNo,_self.partNoLinkClicked(params.data.itemId))}
      },
      {
        headerName: "Manufacturer",
        field: "manufacturer",
        headerClass: "grid-header",
        width: 175,
      },
      {
        headerName: "Commodity",
        field: "commodity",
        headerClass: "grid-header",
        width: 175,
      },
      {
        headerName: "Avaliable",
        field: "avaliable",
        headerClass: "grid-header",
        width: 175,
        cellRenderer: "agGroupCellRenderer"
      },
      {
        headerName: "On Order",
        field: "onOrder",
        headerClass: "grid-header",
        width: 175,
      },
      {
        headerName: "On Hand",
        field: "onHand",
        headerClass: "grid-header",
        width: 175,
      },
      {
        headerName: "Reserved",
        field: "reserved",
        headerClass: "grid-header",
        width: 175,
      },
      {
        headerName:"",
        headerClass:"grid-header",
        checkboxSelection: true,
        width: 30,
        minWidth: 30,
        maxWidth: 30,
        suppressSorting: true,
        lockPinned: true,
        pinned: "left",
      },  

    ]
  }

  createClickIcon(avaliableQty, clickEvent) {
    if (avaliableQty > 0) {
      var i = document.createElement('i');
      i.className = "fas fa-plus";
      i.addEventListener('click', clickEvent);
      return i;
    }
  }

  avaliableClicked(itemId) {
    return () => {
      this.itemId = itemId;
    }
  }
  createPartNoLink(displayText,clickEvent){
   var anchor= document.createElement('a');
   anchor.href='javascript:void(0)';
   anchor.text=displayText;
   anchor.addEventListener('click',clickEvent);
   return anchor;
  }
  partNoLinkClicked(itemId){
   return ()=> this.router.navigate(['pages/items/items/item-details',{itemId:itemId}]);
  }


  populateGrid() {
    this.bomService.getPartSearchResult(this.searchParameter, this.searchType).subscribe(
      data => {
        if(data.length >0){
          this.partSearched = false;
        }else{
          this.partSearched = true;
        }

        let dataSource = [];
        data.forEach(element => {
          dataSource.push({
            manPartNo: element.partNumber,
            manufacturer: element.mfrName,
            commodity: element.commodityName,
            avaliable: element.available,
            onOrder: element.onOrder,
            onHand: element.onHand,
            reserved: element.reserved,
            itemId: element.itemId
          })

        });
        this.partSearchGrid.api.setRowData(dataSource);
        this.partSearchGrid.api.sizeColumnsToFit();
      }
    )
  }

  addNewItem(){
    this.router.navigate(['pages/items/items/item-details']);
  } 

}
