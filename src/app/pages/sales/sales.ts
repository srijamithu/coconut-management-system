import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';


interface Sale {
  id: string;
  customerName: string;
  coconutType: string;
  quantity: number;
  unit: string;
  purchasePrice?: number;
  sellingPrice: number;
  totalAmount: number;
  saleDate: string;
}

interface InventoryStock {
  id: string;
  coconutType: string;
  quantity: number;
  unit: string;
  purchasePrice: number;
  sellingPrice: number;
  status: string;
}

@Component({
  selector: 'app-sales',
  imports: [FormsModule],
  templateUrl: './sales.html',
  styleUrl: './sales.scss',
})
export class Sales {

  private readonly storageKey = 'coconut_sales';
  private readonly inventoryStorageKey = 'coconut_inventory';

  today = (() => {
    const date = new Date();

    return [
      date.getFullYear(),
      String(date.getMonth() + 1).padStart(2, '0'),
      String(date.getDate()).padStart(2, '0')
    ].join('-');
  })();
  constructor() {
    const savedSales = localStorage.getItem(this.storageKey);

    if (savedSales) {
      try {
        this.sales = JSON.parse(savedSales) as Sale[];
      } catch {
        console.error('Unable to load saved sales.');
      }
    } else {
      this.saveSales();
    }
  }

  private saveSales(): void {
    try {
      localStorage.setItem(
        this.storageKey,
        JSON.stringify(this.sales)
      );
    }catch {
      console.error('Unable to save sales.');
    }
  }

  private getInventoryPurchasePrice(
    coconutType: string,
    unit: string
  ): number | null {
    const stored = localStorage.getItem(this.inventoryStorageKey);

    const stocks: InventoryStock[] = stored
    ? JSON.parse(stored)
    : [];

    const stock = stocks.find(
      item =>
        item.coconutType === coconutType &&
      item.unit === unit
    );

    return stock ? stock.purchasePrice : null;
  }

  private updateInventoryStock(
    coconutType: string,
    unit: string,
    quantityChange: number
  ): boolean {
    try {
      const stored = localStorage.getItem(this.inventoryStorageKey);

      const stocks: InventoryStock[] = stored
      ? JSON.parse(stored)
      :[];

      const stockIndex = stocks.findIndex(
        stock =>
          stock.coconutType === coconutType &&
        stock.unit === unit
      );

      if (stockIndex === -1) {
        window.alert('Matching inventory stock not found.');
        return false;
      }

      const newQuantity = 
      stocks[stockIndex].quantity + quantityChange;

      if (newQuantity < 0) {
        window.alert('Insufficent inventory stock.');
        return false;
      }

      stocks[stockIndex].quantity = newQuantity;

      stocks[stockIndex].status =
      newQuantity === 0
      ? 'Out of Stock'
      : newQuantity <= 50
      ? 'Low Stock'
      : 'Available';

      localStorage.setItem(
        this.inventoryStorageKey,
        JSON.stringify(stocks)
      );

      return true;
    } catch (error) {
      console.error('Unable to update inventory:', error);
      window.alert('Unable to update inventory.');
      return false;
    }
  }
  showForm = false;

  searchText = '';
  
  currentPage = 1;

  itemsPerPage = 5;

  editingSaleId: string | null = null;

  newSale = {
    customerName: '',
    coconutType: '',
    quantity: 0,
    unit: 'Pieces',
    sellingPrice: 0,
    saleDate: ''
  };

  deleteSale(sale: Sale): void {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${sale.id}?`
    );

    if (!confirmed) {
      return;
    }

    const stockUpdated = this.updateInventoryStock(
      sale.coconutType,
      sale.unit,
      sale.quantity
    );

    if (!stockUpdated) {
      return;
    }

    this.sales = this.sales.filter(
      item => item.id !== sale.id
    );
    this.saveSales();
  }

  formErrors = {
    customerName: '',
    coconutType: '',
    quantity: '',
    sellingPrice: '',
    saleDate: ''
  };

  openForm(): void {
    this.resetForm();
    this.showForm = true;
  }

  closeForm(): void {
    this.showForm = false;
    this.resetForm();
  }

  saveSale(): void {
    if (!this.validateSale()) {
      return;
    }

    const quantity = Number(this.newSale.quantity);
    const sellingPrice = Number(this.newSale.sellingPrice);

    const purchasePrice = this.getInventoryPurchasePrice(
      this.newSale.coconutType,
      this.newSale.unit
    );

    if (purchasePrice === null) {
      window.alert('Purchase price not found in Inventory.');
      return;
    }

    if(this.editingSaleId) {
      const index = this.sales.findIndex(
        sale => sale.id === this.editingSaleId
      );

      if(index !== -1) {
        const oldSale = this.sales[index];

        if(
          oldSale.coconutType === this.newSale.coconutType &&
          oldSale.unit === this.newSale.unit
        ) {
          const stockUpdated = this.updateInventoryStock(
            oldSale.coconutType,
            oldSale.unit,
            oldSale.quantity - quantity
          );

          if (!stockUpdated) {
            return;
          }
        } else {
          const newStockUpdated = this.updateInventoryStock(
            this.newSale.coconutType,
            this.newSale.unit,
            -quantity
          );

          if (!newStockUpdated) {
            return;
          }

          const oldStockRestored = this.updateInventoryStock(
            oldSale.coconutType,
            oldSale.unit,
            oldSale.quantity
          );

          if(!oldStockRestored) {
            this.updateInventoryStock(
              this.newSale.coconutType,
              this.newSale.unit,
              quantity
            );
            return;
          }
        }
        this.sales[index] = {
          ...oldSale,
          ...this.newSale,
          quantity,
          purchasePrice,
          sellingPrice,
          totalAmount: quantity * sellingPrice
        };
      }
    }
    else {
      const nextId = this.sales.reduce((max, sale) => {
        const match = sale.id.match(/^SAL(\d+)$/i);

        if (!match) {
          return max;
        }

        return Math.max(max, Number(match[1]));
      }, 0) + 1;

      const sale: Sale = {
        id: 'SAL' + String(nextId).padStart(3, '0'),
        ...this.newSale,
        quantity,
        purchasePrice,
        sellingPrice,
        totalAmount: quantity * sellingPrice
      };

      const stockUpdated = this.updateInventoryStock(
        sale.coconutType,
        sale.unit,
        -sale.quantity
      );

      if (!stockUpdated){
        return;
      }
      this.sales.push(sale);
    }

     this.saveSales();
    this.closeForm();
  }

  

  private validateSale(): boolean {
    const errors = {
      customerName: '',
      coconutType: '',
      quantity: '',
      sellingPrice: '',
      saleDate: ''
    };

    if(!this.newSale.customerName.trim()){
      errors.customerName = 'Customer name is required.';
    }

     if (!this.newSale.coconutType) {
    errors.coconutType = 'Coconut type is required.';
  }

  const quantity = Number(this.newSale.quantity);

  if (
    !Number.isFinite(quantity) ||
    quantity <= 0 ||
    !Number.isInteger(quantity)
  ) {
    errors.quantity = 'Quantity must be a positive whole number.';
  }

  const sellingPrice = Number(this.newSale.sellingPrice);

  if (
    !Number.isFinite(sellingPrice) ||
    sellingPrice <= 0
  ) {
    errors.sellingPrice = 'Selling price must be greater than zero.';
  }

  if (!this.newSale.saleDate) {
    errors.saleDate = 'Sale date is required.';
  } else if (
    this.newSale.saleDate > this.today
  ) {
    errors.saleDate = 'Future sale dates are not allowed.';
  }

  this.formErrors = errors;

  return !Object.values(errors).some(error => error !== '');
}

editSale(sale: Sale): void {
  this.editingSaleId = sale.id;

  this.newSale= {
    customerName: sale.customerName,
    coconutType: sale.coconutType,
    quantity: sale.quantity,
    unit: sale.unit,
    sellingPrice: sale.sellingPrice,
    saleDate: sale.saleDate
  };

  this.formErrors = {
    customerName: '',
    coconutType: '',
    quantity: '',
    sellingPrice: '',
    saleDate: ''
  };

  this.showForm = true;

}
  resetForm(): void {
    this.editingSaleId = null;

    this.newSale = {
      customerName: '',
      coconutType: '',
      quantity: 0,
      unit:  'Pieces',
      sellingPrice: 0,
      saleDate: ''
    };

    this.formErrors = {
      customerName: '',
      coconutType: '',
      quantity: '',
      sellingPrice: '',
      saleDate: ''
    };

  }

   getTotalQuantity(): String {
      const totals = this.sales.reduce((result, sale) => {
        result[sale.unit] = (result[sale.unit] || 0) + sale.quantity;
        return result;
      }, {} as Record<string, number>);

      return Object.entries(totals)
      .map(([unit, quantity]) => `${quantity} ${unit}`)
      .join(', ') || '0';
    }

    getTotalRevenue(): number {
      return this.sales.reduce(
        (total, sale) => total + sale.totalAmount,
        0
      );
    }

   
getTotalProfit(): number {
  return this.sales.reduce(
    (total, sale) => {
      if (sale.purchasePrice === undefined) {
        return total;
      }

      return total +
      (sale.sellingPrice - sale.purchasePrice) * sale.quantity;
    }, 0);
}


  sales: Sale[] = [

    {
      id: 'SAL001',
      customerName: 'Ramesh',
      coconutType: 'Mature Coconut',
      quantity: 100,
      unit: 'Pieces',
      sellingPrice: 20,
      totalAmount: 2000,
      saleDate: '2026-11-17'
    },
    {
      id: 'SAL002',
      customerName: 'Suresh',
      coconutType: 'Tender Coconut',
      quantity: 50,
      unit: 'Pieces',
      sellingPrice: 30,
      totalAmount: 1500,
      saleDate: '2026-11-18'
    }
  ];

  get filteredSales(): Sale[] {
    const search = this.searchText.trim().toLowerCase();

    if(!search) {
      return this.sales;
    }

    return this.sales.filter(sale =>
      sale.id.toLowerCase().includes(search) ||
      sale.customerName.toLowerCase().includes(search) ||
      sale.coconutType.toLowerCase().includes(search)
    );
  }

  get totalPages(): number {
    return Math.ceil(this.filteredSales.length / this.itemsPerPage);
  }

  get paginatedSales(): Sale[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;

    return this.filteredSales.slice(
      startIndex,
      startIndex + this.itemsPerPage
    );
  }

  previousPage(): void {
    if (this.currentPage > 1){
      this.currentPage--;
    }
  }

  nextPage(): void{
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }
}
