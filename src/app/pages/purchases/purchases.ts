import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

interface Purchase {
  id: string;
  supplierName: string;
  coconutType: string;
  quantity: number;
  unit: string;
  purchasePrice: number;
  totalAmount: number;
  purchaseDate: string;
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

const SAMPLE_PURCHASES: Purchase[] = [
  {
    id: 'PUR001',
    supplierName: 'Ramesh',
    coconutType: 'Mature Coconut',
    quantity: 500,
    unit: 'Pieces',
    purchasePrice: 15,
    totalAmount: 7500,
    purchaseDate: '2026-11-16'
  }
];

@Component({
  selector: 'app-purchases',
  imports: [FormsModule],
  templateUrl: './purchases.html',
  styleUrl: './purchases.scss',
})
export class Purchases {
  private readonly storageKey = 'coconut_purchases';
  private readonly inventoryStorageKey = 'coconut_inventory';

  readonly pageSize = 5;
  currentPage = 1;

  showForm = false;
  editingPurchaseId: string | null = null;

  purchases: Purchase[] = this.loadPurchases();

  private _searchText = '';

  get searchText(): string {
    return this._searchText;
  }

  set searchText(value: string) {
    this._searchText = value;
    this.currentPage = 1;
  }

  newPurchase = {
    supplierName: '',
    coconutType: '',
    quantity: 0,
    unit: 'Pieces',
    purchasePrice: 0,
    purchaseDate: ''
  };

  formErrors = {
    supplierName: '',
    coconutType: '',
    quantity: '',
    purchasePrice: '',
    purchaseDate: ''
  };

  get filteredPurchases(): Purchase[] {
    const search = this.searchText.trim().toLowerCase();

    if (!search) {
      return this.purchases;
    }

    return this.purchases.filter(
      (purchase) =>
        purchase.id.toLowerCase().includes(search) ||
        purchase.supplierName.toLowerCase().includes(search) ||
        purchase.coconutType.toLowerCase().includes(search)
    );
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.filteredPurchases.length / this.pageSize));
  }

  get pagedPurchases(): Purchase[] {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    return this.filteredPurchases.slice(startIndex, startIndex + this.pageSize);
  }

  get isFirstPage(): boolean {
    return this.currentPage <= 1;
  }

  get isLastPage(): boolean {
    return this.currentPage >= this.totalPages;
  }

  get pageStart(): number {
    return (this.currentPage - 1) * this.pageSize + 1;
  }

  get pageEnd(): number {
    return Math.min(this.currentPage * this.pageSize, this.filteredPurchases.length);
  }

  previousPage(): void {
    if (!this.isFirstPage) {
      this.currentPage--;
    }
  }

  nextPage(): void {
    if (!this.isLastPage) {
      this.currentPage++;
    }
  }

  openForm(): void {
    this.resetForm();
    this.showForm = true;
  }

  editPurchase(purchase: Purchase): void {
    this.editingPurchaseId = purchase.id;
    this.newPurchase = {
      supplierName: purchase.supplierName,
      coconutType: purchase.coconutType,
      quantity: purchase.quantity,
      unit: purchase.unit,
      purchasePrice: purchase.purchasePrice,
      purchaseDate: purchase.purchaseDate
    };
    this.resetErrors();
    this.showForm = true;
  }

  closeForm(): void {
    this.showForm = false;
    this.resetForm();
  }

  resetForm(): void {
    this.editingPurchaseId = null;
    this.newPurchase = {
      supplierName: '',
      coconutType: '',
      quantity: 0,
      unit: 'Pieces',
      purchasePrice: 0,
      purchaseDate: ''
    };
    this.resetErrors();
  }

  private resetErrors(): void {
    this.formErrors = {
      supplierName: '',
      coconutType: '',
      quantity: '',
      purchasePrice: '',
      purchaseDate: ''
    };
  }

  savePurchase(): void {
    if (!this.validatePurchase()) {
      return;
    }

    const quantity = Number(this.newPurchase.quantity);
    const purchasePrice = Number(this.newPurchase.purchasePrice);
    const totalAmount = quantity * purchasePrice;

    if (this.editingPurchaseId) {
      const index = this.purchases.findIndex(
        (purchase) => purchase.id === this.editingPurchaseId
      );

      if (index !== -1) {

        const oldPurchase = this.purchases[index];

        this.purchases[index] = {
          ...this.purchases[index],
          supplierName: this.newPurchase.supplierName.trim(),
          coconutType: this.newPurchase.coconutType,
          quantity,
          unit: this.newPurchase.unit,
          purchasePrice,
          totalAmount,
          purchaseDate: this.newPurchase.purchaseDate
        };

        if (
          oldPurchase.coconutType === this.newPurchase.coconutType &&
          oldPurchase.unit === this.newPurchase.unit
        ) {
          this.updaeteInventoryStock(
            oldPurchase.coconutType,
            oldPurchase.unit,
            quantity - oldPurchase.quantity,
            purchasePrice
          );
        } else {
          this.updaeteInventoryStock(
            oldPurchase.coconutType,
            oldPurchase.unit,
            -oldPurchase.quantity,
            oldPurchase.purchasePrice
          );

          this.updaeteInventoryStock(
            this.newPurchase.coconutType,
            this.newPurchase.unit,
            quantity,
            purchasePrice
          );
      }

      this.ensureValidPage();
      }
    } else {
      const nextId =
        this.purchases.reduce((max, purchase) => {
          const idNumber = Number(purchase.id.replace('PUR', ''));
          return Number.isNaN(idNumber) ? max : Math.max(max, idNumber);
        }, 0) + 1;

      const purchase: Purchase = {
        id: 'PUR' + String(nextId).padStart(3, '0'),
        supplierName: this.newPurchase.supplierName.trim(),
        coconutType: this.newPurchase.coconutType,
        quantity,
        unit: this.newPurchase.unit,
        purchasePrice,
        totalAmount,
        purchaseDate: this.newPurchase.purchaseDate
      };

      this.purchases.push(purchase);

      this.updaeteInventoryStock(
        purchase.coconutType,
        purchase.unit,
        purchase.quantity,
        purchase.purchasePrice
      );

      
      this.currentPage = this.totalPages;
    }

    this.savePurchases();
    this.closeForm();
  }

  deletePurchase(purchase: Purchase): void {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${purchase.id}?`
    );

    if (!confirmed) {
      return;
    }

    const stored = localStorage.getItem(this.inventoryStorageKey);

    const stocks: InventoryStock[] = stored
    ? JSON.parse(stored)
    : [];

    const stockIndex = stocks.findIndex(
      stock => 
        stock.coconutType === purchase.coconutType &&
      stock.unit === purchase.unit
    );

    if (stockIndex !== -1) {
      const remainingQuantity = 
      stocks[stockIndex].quantity - purchase.quantity;

      if(remainingQuantity < 0) {
        window.alert(
          'Cannot delete this purchase because inventory quantity is insufficient.'
        );
        return;
      }
    }

    this.updaeteInventoryStock(
      purchase.coconutType,
      purchase.unit,
      -purchase.quantity,
      purchase.purchasePrice
    );
    
    this.purchases = this.purchases.filter((item) => item.id !== purchase.id);
    this.ensureValidPage();
    this.savePurchases();
  }

  private validatePurchase(): boolean {
    const errors = {
      supplierName: '',
      coconutType: '',
      quantity: '',
      purchasePrice: '',
      purchaseDate: ''
    };

    if (!this.newPurchase.supplierName.trim()) {
      errors.supplierName = 'Supplier name is required.';
    }

    if (!this.newPurchase.coconutType.trim()) {
      errors.coconutType = 'Coconut type is required.';
    }

    const quantityValue = this.newPurchase.quantity as unknown;
    const quantity = Number(quantityValue);
    if (
      quantityValue === null ||
      quantityValue === undefined ||
      quantityValue === '' ||
      Number.isNaN(quantity) ||
      quantity <= 0
    ) {
      errors.quantity = 'Quantity must be greater than zero.';
    }

    const priceValue = this.newPurchase.purchasePrice as unknown;
    const purchasePrice = Number(priceValue);
    if (
      priceValue === null ||
      priceValue === undefined ||
      priceValue === '' ||
      Number.isNaN(purchasePrice) ||
      purchasePrice <= 0
    ) {
      errors.purchasePrice = 'Purchase price must be greater than zero.';
    }

    if (!this.newPurchase.purchaseDate) {
      errors.purchaseDate = 'Purchase date is required.';
    }

    this.formErrors = errors;

    return (
      !errors.supplierName &&
      !errors.coconutType &&
      !errors.quantity &&
      !errors.purchasePrice &&
      !errors.purchaseDate
    );
  }

  private ensureValidPage(): void {
    if (this.currentPage > this.totalPages) {
      this.currentPage = this.totalPages;
    }

    if (this.currentPage < 1) {
      this.currentPage = 1;
    }
  }

  private loadPurchases(): Purchase[] {
    try {
      const stored = localStorage.getItem(this.storageKey);

      if (stored === null) {
        return this.getSamplePurchases();
      }

      const parsed: unknown = JSON.parse(stored);

      if (!Array.isArray(parsed)) {
        return this.getSamplePurchases();
      }

      return parsed
        .filter((purchase): purchase is Purchase => this.isPurchase(purchase))
        .map((purchase) => ({
          ...purchase,
          totalAmount: Number(purchase.quantity) * Number(purchase.purchasePrice)
        }));
    } catch {
      return this.getSamplePurchases();
    }
  }

  private savePurchases(): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.purchases));
    } catch {}
  }

  private updaeteInventoryStock(
    coconutType: string,
    unit: string,
    quantityChange: number,
    purchasePrice: number
  ): void {
    try {
      const stored = localStorage.getItem(this.inventoryStorageKey);

      const stocks: InventoryStock[] = stored
      ? JSON.parse(stored)
      : [];

      const stockIndex = stocks.findIndex(
        stock => 
          stock.coconutType === coconutType &&
        stock.unit === unit
      );

      if(stockIndex !== -1) {
        stocks[stockIndex].quantity += quantityChange;

        stocks[stockIndex].status = 
        stocks[stockIndex].quantity === 0
        ? 'Out of Stock'
        : stocks[stockIndex].quantity <= 50
        ? 'Low Stock'
        : 'Available';
      } else if (quantityChange > 0) {
        const nextId = stocks.reduce((max, stock) => {
          const idNumber = Number(stock.id.replace('STK', ''));
          return Number.isNaN(idNumber)
          ? max
          : Math.max(max, idNumber);
        }, 0) + 1;

        stocks.push({
          id: 'STK' + String(nextId).padStart(3, '0'),
          coconutType,
          quantity: quantityChange,
          unit,
          purchasePrice,
          sellingPrice: purchasePrice,
          status:
          quantityChange === 0
          ? 'Out of Stock'
          : quantityChange <= 50
          ? 'Low Stock'
          : 'Available'
        });
      }

      localStorage.setItem(
        this.inventoryStorageKey,
        JSON.stringify(stocks)
      );
    } catch (error) {
      console.error('Unable to update inventory stock:', error);
    }
  }
    
  private getSamplePurchases(): Purchase[] {
    return SAMPLE_PURCHASES.map((purchase) => ({ ...purchase }));
  }

  private isPurchase(value: unknown): value is Purchase {
    if (typeof value !== 'object' || value === null) {
      return false;
    }

    const purchase = value as Record<string, unknown>;

    return (
      typeof purchase['id'] === 'string' &&
      typeof purchase['supplierName'] === 'string' &&
      typeof purchase['coconutType'] === 'string' &&
      typeof purchase['quantity'] === 'number' &&
      typeof purchase['unit'] === 'string' &&
      typeof purchase['purchasePrice'] === 'number' &&
      typeof purchase['totalAmount'] === 'number' &&
      typeof purchase['purchaseDate'] === 'string'
    );
  }
}
