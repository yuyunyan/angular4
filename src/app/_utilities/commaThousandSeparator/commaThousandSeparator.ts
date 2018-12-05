import { Injectable } from '@angular/core';

export class CommaThousandSeparator {


  commaThousand(x){
    return (parseFloat(x).toFixed(2)).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }
}