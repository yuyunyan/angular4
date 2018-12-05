import { Component, OnInit,AfterViewInit,ViewChild,ViewContainerRef, OnDestroy} from '@angular/core';
import { AgEditorComponent } from "ag-grid-angular";
import { InputComService } from './../../../_coms/input-com.service';

@Component({
  selector: 'az-mfr-input',
  templateUrl: './mfr-input.component.html',
  styleUrls: ['./mfr-input.component.scss']
})
export class MfrInputComponent implements AgEditorComponent, AfterViewInit, OnDestroy {

  ngOnDestroy(): void {
		this.container.element.nativeElement.remove();
	}
	private params: any;
	private _params;
	private selectedValue:string;
  private isDisabled:boolean;

	constructor(private inputComService: InputComService) {
    let _self = this;
    inputComService.$mfrChanged.subscribe(data => {
      _self.selectedValue = data;
    });

    inputComService.$enableDisable.subscribe(data =>{
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
	ngAfterViewInit() {
	}

	agInit(params:any):void {
		this._params = params;
		this.selectedValue = params.value;
  }

	getValue():any {
   	return this.selectedValue;
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
