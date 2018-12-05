import { Injectable } from '@angular/core';

export class DateFormatter {


formatDate(orderDate){
    if(!orderDate){
      return '';
    }
    let formatDate = new Date(orderDate); 
    let options = { year: 'numeric', month: '2-digit', day: '2-digit' };
    return formatDate.toLocaleDateString('en', options);
}
}