import { Component, OnInit, SimpleChanges, Input, ViewEncapsulation, OnChanges, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'az-comment-line',
  templateUrl: './comment-line.component.html',
  styleUrls: ['./comment-line.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class CommentLineComponent implements OnChanges {

  private inCreateMode = false;
  @Input() comment;
  @Input() commentIdx: number;
  @Input() lastChild: boolean;
  @Output() onRelpyToCommentClicked: EventEmitter<any> = new EventEmitter();

  ngOnChanges(){

  }

  onBtnClicked(){
    //jQuery()
    this.onRelpyToCommentClicked.emit();
    this.inCreateMode = true;
  }
}
