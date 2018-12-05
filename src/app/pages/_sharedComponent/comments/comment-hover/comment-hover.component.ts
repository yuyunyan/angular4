import { Component, SimpleChanges, Input, ViewEncapsulation, OnChanges, ViewChildren, ViewContainerRef
, Output, EventEmitter } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';
import { CommentsService } from './../../../../_services/comments.service';
import { Comment } from './../../../../_models/shared/comment';
import * as _ from 'lodash';

@Component({
selector: 'az-comment-hover',
templateUrl: './comment-hover.component.html',
styleUrls: ['./comment-hover.component.scss'],
encapsulation: ViewEncapsulation.None
})

export class CommentHoverComponent implements OnChanges {
	@Input() objectTypeId;
	@Input() objectId;
	@Input() objectInfo;
	@Input() alternativeObjectTypeId;
	@Input() alternativeObjectId;

	private comment: Comment;
	private ngUnsubscribe: Subject<void> = new Subject<void>();

	constructor(private commentsService: CommentsService){
	}

	ngOnChanges(changes: SimpleChanges){
		if (this.objectId && this.objectTypeId && this.alternativeObjectId && this.alternativeObjectTypeId) {
			this.comment = undefined;
			this.getCommentsByAlter();
		} else if (this.objectId && this.objectTypeId){
			this.comment = undefined;
			this.getComments();
		} else if(changes.objectId && !changes.objectId.currentValue) {
			this.comment = undefined;
		}
	}

	getCommentsByAlter(){
		const _self = this;
		Observable.forkJoin(
			_self.commentsService.getComments(_self.objectId, _self.objectTypeId, ''),
			_self.commentsService.getComments(_self.alternativeObjectId, _self.alternativeObjectTypeId, '')
		).takeUntil(_self.ngUnsubscribe.asObservable()).subscribe(data => {
			const result = data[0].concat(data[1]);
			result.sort((commenta, commentb) => {
				let commentATimestamp = new Date(commenta.created);
				let commentBTimestampb = new Date(commentb.created);
				return commentATimestamp > commentBTimestampb? 1: -1;
			});
			_self.comment = result[result.length -1];
		});
	}

	getComments() {
		const _self = this;
		_self.commentsService.getComments(_self.objectId, _self.objectTypeId, '')
		.takeUntil(_self.ngUnsubscribe.asObservable()).subscribe(data => {
			if (data && data.length > 0){
				_self.comment = data[data.length -1];
			}
		});
	}

	ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
