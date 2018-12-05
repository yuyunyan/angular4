import { Component, OnInit, SimpleChanges, Input, ViewEncapsulation, OnChanges, Output, EventEmitter
  , OnDestroy } from '@angular/core';
import { CommentsService } from './../../../../_services/comments.service';
import { UserLogInResponse } from './../../../../_models/userLogInResponse';
import { Comment } from './../../../../_models/shared/comment';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';

@Component({
  selector: 'az-comments-reply',
  templateUrl: './comments-reply.component.html',
  styleUrls: ['./comments-reply.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class CommentsReplyComponent implements OnChanges, OnDestroy {

    @Input() objectId: number;
    @Input() objectTypeId: number;
    @Input() commentTypeMap: Array<object>;
    @Input() replyToId: number;
    @Input() hideCommentType: boolean = true;

    private inputSubject: Subject<any> = new Subject<any>();
    private ngUnsubscribe: Subject<void> = new Subject<void>();

    @Output() onCommentReplyClosed = new EventEmitter();
    @Output() onCommentSaved: EventEmitter<Comment>;

    private loggedInResponse: UserLogInResponse;
    private commentTypeId: number;
    private commentContent: string;
    private selectedUndefinedOption: any;
    private invalidForm: boolean = false;

    constructor(private commentsService: CommentsService) {
      const _self = this;
      this.loggedInResponse = JSON.parse(localStorage.getItem('currentUser'));
      this.onCommentSaved = new EventEmitter<Comment>();
      this.inputSubject.asObservable()
        .throttleTime(1000)
        .subscribe((newComment) => {
          this.commentsService.setComment(newComment).subscribe(
            (data: Comment) => {
              _self.commentContent = '';
              _self.onCommentSaved.emit(data);
              if (data && data.replyToId) {
                _self.onCommentReplyClosed.emit();
              }
            }
          )
        });
        // if (this.data.replyToId
    }
    
    ngOnChanges(changes: SimpleChanges) {
        if (changes.hideCommentType)
        console.log('changes on commentReply ',changes.hideCommentType)
    }

    createComment($event) {

      const _self = this;
      if (!this.commentContent){
        return;
      }
      if (($event.which === 1 || $event.which === 13) && this.commentContent.trim() != '') {
        _self.invalidForm = !this.commentTypeId;
        if (!_self.hideCommentType && _self.invalidForm){
          return;
        }
        const newComment = {
          objectId: this.objectId,
          objectTypeId: this.objectTypeId,
          replyToId: this.replyToId,
          commentTypeId: this.commentTypeId,
          comment: this.commentContent.trim(),
          isDeleted: false
        };
        this.inputSubject.next(newComment);
       }
    }

    ngOnDestroy(){
      this.ngUnsubscribe.next();
      this.ngUnsubscribe.complete();

    }
}
