import {Component, Input, Output, EventEmitter} from '@angular/core';

@Component({
    selector:"ag-clickable",
    template:`<button (click)=click()>Deactivate</button>`
})
export class ClickableComponent{
    @Input() cell:any;
    @Output() onClicked = new EventEmitter<boolean>();

    click(){
        this.onClicked.emit(this.cell);
    }
}