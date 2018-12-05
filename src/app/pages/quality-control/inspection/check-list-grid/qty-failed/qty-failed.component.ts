import { Component, OnInit, ViewChild, ViewContainerRef } from '@angular/core';

@Component({
  selector: 'az-qty-failed',
  templateUrl: './qty-failed.component.html',
  styleUrls: ['./qty-failed.component.scss']
})
export class QtyFailedComponent implements OnInit {

  private params:any;
  @ViewChild('QtyFailed', {read: ViewContainerRef}) public input;
  constructor() { }
  
  ngOnInit() {}
  
  agInit(params: any): void {
    this.params = params;
    let _self = this;
    this.input.element.nativeElement.addEventListener("keydown", function(e) {
      _self.invalidChar(event);
    });

  }

  refresh?(params: any): void {
    
  }
  
  //Handles characters not restricted from input type="number"
  invalidChar(event) {
    var invalidChars = [ "-", "+", "e", "."];
    if (invalidChars.includes(event.key)) {
      event.preventDefault();
    }
  }

  onKeyDown(event):void {
        let key = event.which || event.keyCode;
        if (key == 37 ||  // left
            key == 39 ||  // left
            key == 38||  // up
            key == 40) {  // down
            event.stopPropagation();
        }
    }

    onFocusOut(event){
      this.params.context.parentComponent.save(this.params.data.id, true,false);
    }

  ngOnDestroy(): void {
    
  }

}
