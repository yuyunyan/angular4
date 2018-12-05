import { Router } from '@angular/router';
import { Injectable } from '@angular/core';

@Injectable()
export class LinkCreator
{
    constructor(private router: Router){}


    public createItemLink(itemId, partNumber){
        let url= `pages/items/items/item-details;itemId=${itemId}`;
        let _self = this;
        let anchor = document.createElement('a');
        anchor.href = "javascript:void(0)";
        anchor.addEventListener('click', function(){
          //  _self.router.navigate(['pages/items/items/item-details',{itemId: itemId}]);
          return window.open(url,'_blank');
        });
        anchor.innerHTML = partNumber;
        return anchor;
    }

}