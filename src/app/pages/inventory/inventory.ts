import { Component } from '@angular/core';

interface stock {
  id: string;
  cocunutType: string;
  quantity: number;
  unit: string;
  purchasePrice: number;
  sellingPrice: number;
  status: string;
}

@Component({
  selector: 'app-inventory',
  imports: [],
  templateUrl: './inventory.html',
  styleUrl: './inventory.scss',
})
export class Inventory {
  stocks: Stock[] = [
    {
      id: 'STK001',
      coconutType: 'Mature Coconut',
      quantity: 500,
      unit: 'Pieces',
      purchasePrice: 15,
      sellingPrice: 20,
      status: 'Available'
    },
    {
      id: 'STK002',
      coconutType: 'Tender Coconut',
      quantity: 300,
      unit: 'Pieces',
      purchasePrice: 20,
      sellingPrice: 30,
      status: 'Available'
    }
  ];

}
