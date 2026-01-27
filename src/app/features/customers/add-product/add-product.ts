import { Component } from '@angular/core';
import {  Router } from '@angular/router';

@Component({
  selector: 'app-add-product',
  imports: [],
  templateUrl: './add-product.html',
  styleUrl: './add-product.css',
})
export class AddProduct {

constructor(private router: Router) {}

goHome() {
  this.router.navigate(['/customers']);
}



}
