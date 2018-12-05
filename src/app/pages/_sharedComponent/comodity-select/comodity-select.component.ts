import { Component, OnInit,AfterViewInit,ViewChild,ViewContainerRef, OnDestroy} from '@angular/core';
import { AgEditorComponent } from "ag-grid-angular";
import { InputComService } from './../../../_coms/input-com.service';
@Component({
  selector: 'az-comodity-select',
  templateUrl: './comodity-select.component.html',
  styleUrls: ['./comodity-select.component.scss']
})
export class ComoditySelectComponent implements AgEditorComponent, AfterViewInit, OnDestroy {
  ngOnDestroy(): void {
		this.container.element.nativeElement.remove();
	}
	private params: any;
	private _params;
	private options: any[];
	private selectedValue:string;
  private isDisabled:boolean;

	constructor(private commodityComService: InputComService) {
    let _self = this;
    commodityComService.$commodityChanged.subscribe(data => {
      _self.selectedValue = data;
    });

    commodityComService.$enableDisable.subscribe(data =>{
      
      if(data === false){
        _self.isDisabled = true;
      }
      else{
        _self.isDisabled = false;
      }
    })
  	}

	@ViewChild('container', {read: ViewContainerRef}) container;
	
	// dont use afterGuiAttached for post gui events - hook into ngAfterViewInit instead for this
	ngAfterViewInit() {}

	agInit(params:any):void {
		this._params = params;

		//If no option is selected, select first one
		if (params.value.name)
			this.selectedValue = params.value.name;
		else
			this.selectedValue = params.values[0].name
		
			//Bind all available options
    this.options = params.values;
    
	}

	getValue():any {
   
		return this.options.find(x => x.name == this.selectedValue);
	}

	isPopup():boolean {
		return false;
	}

	focusIn()
	{
		this.container.element.nativeElement.focus();
	}

	onKeyDown(event):void {
		let key = event.which || event.keyCode;

		if (key == 13)
		{
				event.stopPropagation();
		}

		if (key == 37 ||  // left
			key == 39) {  // right

			event.stopPropagation();


		}
	}
}
