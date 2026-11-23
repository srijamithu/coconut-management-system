import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

interface Stock {
  id: string;
  coconutType: string;
  quantity: number;
  unit: string;
  purchasePrice: number;
  sellingPrice: number;
  status: string;
}

const SAMPLE_STOCKS: Stock[] = [
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

@Component({
  selector: 'app-inventory',
  imports: [FormsModule],
  templateUrl: './inventory.html',
  styleUrl: './inventory.scss',
})
export class Inventory {
  private readonly storageKey = 'coconut_inventory';

  readonly pageSize = 5;
  currentPage = 1;

  showForm = false;
  editingStockId: string | null = null;

  stocks: Stock[] = this.loadStocks();

  private _searchText = '';

  get searchText(): string {
    return this._searchText;
  }

  set searchText(value: string) {
    this._searchText = value;
    this.currentPage = 1;
  }

  newStock = {
    coconutType: '',
    quantity: 0,
    unit: 'Pieces',
    purchasePrice: 0,
    sellingPrice: 0
  };

  formErrors = {
    coconutType: '',
    quantity: '',
    purchasePrice: '',
    sellingPrice: ''
  };

  get filteredStocks(): Stock[] {
    const search = this.searchText.trim().toLowerCase();

    if (!search) {
      return this.stocks;
    }

    return this.stocks.filter(
      (stock) =>
        stock.coconutType.toLowerCase().includes(search) ||
        stock.id.toLowerCase().includes(search)
    );
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.filteredStocks.length / this.pageSize));
  }

  get pagedStocks(): Stock[] {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    return this.filteredStocks.slice(startIndex, startIndex + this.pageSize);
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
    return Math.min(this.currentPage * this.pageSize, this.filteredStocks.length);
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

  editStock(stock: Stock): void {
    this.editingStockId = stock.id;
    this.newStock = {
      coconutType: stock.coconutType,
      quantity: stock.quantity,
      unit: stock.unit,
      purchasePrice: stock.purchasePrice,
      sellingPrice: stock.sellingPrice
    };
    this.resetErrors();
    this.showForm = true;
  }

  closeForm(): void {
    this.showForm = false;
    this.resetForm();
  }

  resetForm(): void {
    this.editingStockId = null;
    this.newStock = {
      coconutType: '',
      quantity: 0,
      unit: 'Pieces',
      purchasePrice: 0,
      sellingPrice: 0
    };
    this.resetErrors();
  }

  private resetErrors(): void {
    this.formErrors = {
      coconutType: '',
      quantity: '',
      purchasePrice: '',
      sellingPrice: ''
    };
  }

  saveStock(): void {
    if (!this.validateStock()) {
      return;
    }

    const quantity = Number(this.newStock.quantity);
    const purchasePrice = Number(this.newStock.purchasePrice);
    const sellingPrice = Number(this.newStock.sellingPrice);
    const status = this.calculateStatus(quantity);

    if (this.editingStockId) {
      const index = this.stocks.findIndex(
        (stock) => stock.id === this.editingStockId
      );

      if (index !== -1) {
        this.stocks[index] = {
          ...this.stocks[index],
          coconutType: this.newStock.coconutType,
          quantity,
          unit: this.newStock.unit,
          purchasePrice,
          sellingPrice,
          status
        };
      }

      this.ensureValidPage();
    } else {
      const nextId = this.stocks.reduce((max, stock) => {
        const idNumber = Number(stock.id.replace('STK', ''));
        return Number.isNaN(idNumber) ? max : Math.max(max, idNumber);
      }, 0) + 1;

      const stock: Stock = {
        id: 'STK' + String(nextId).padStart(3, '0'),
        coconutType: this.newStock.coconutType,
        quantity,
        unit: this.newStock.unit,
        purchasePrice,
        sellingPrice,
        status
      };

      this.stocks.push(stock);
      this.currentPage = this.totalPages;
    }

    this.saveStocks();
    this.closeForm();
  }

  deleteStock(stock: Stock): void {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${stock.id}?`
    );

    if (!confirmed) {
      return;
    }

    this.stocks = this.stocks.filter((item) => item.id !== stock.id);
    this.ensureValidPage();
    this.saveStocks();
  }

  private validateStock(): boolean {
    const errors = {
      coconutType: '',
      quantity: '',
      purchasePrice: '',
      sellingPrice: ''
    };

    if (!this.newStock.coconutType.trim()) {
      errors.coconutType = 'Coconut type is required.';
    }

    const quantityValue = this.newStock.quantity as unknown;
    const quantity = Number(quantityValue);
    if (
      quantityValue === null ||
      quantityValue === undefined ||
      quantityValue === '' ||
      !Number.isFinite(quantity) ||
      quantity < 0
    ) {
      errors.quantity = 'Quantity cannot be negative or empty.';
    }

    const purchasePrice = Number(this.newStock.purchasePrice);
    if (
      this.newStock.purchasePrice === null ||
      this.newStock.purchasePrice === undefined ||
      this.newStock.purchasePrice === ('' as unknown as number) ||
      Number.isNaN(purchasePrice) ||
      purchasePrice <= 0
    ) {
      errors.purchasePrice = 'Purchase price must be greater than zero.';
    }

    const sellingPrice = Number(this.newStock.sellingPrice);
    if (
      this.newStock.sellingPrice === null ||
      this.newStock.sellingPrice === undefined ||
      this.newStock.sellingPrice === ('' as unknown as number) ||
      Number.isNaN(sellingPrice) ||
      sellingPrice <= 0
    ) {
      errors.sellingPrice = 'Selling price must be greater than zero.';
    } else if (!errors.purchasePrice && sellingPrice < purchasePrice) {
      errors.sellingPrice = 'Selling price should not be lower than purchase price.';
    }

    this.formErrors = errors;

    return (
      !errors.coconutType &&
      !errors.quantity &&
      !errors.purchasePrice &&
      !errors.sellingPrice
    );
  }

  private calculateStatus(quantity: number): string {
    if (quantity === 0) {
      return 'Out of Stock';
    }

    if (quantity <= 50) {
      return 'Low Stock';
    }

    return 'Available';
  }

  private ensureValidPage(): void {
    if (this.currentPage > this.totalPages) {
      this.currentPage = this.totalPages;
    }

    if (this.currentPage < 1) {
      this.currentPage = 1;
    }
  }

  private loadStocks(): Stock[] {
    try {
      const stored = localStorage.getItem(this.storageKey);

      if (!stored) {
        return this.getSampleStocks();
      }

      const parsed: unknown = JSON.parse(stored);

      if (!Array.isArray(parsed)) {
        return this.getSampleStocks();
      }

      const stocks = parsed.filter((stock): stock is Stock => this.isStock(stock));

      return stocks.map((stock) => ({
        ...stock,
        status: this.calculateStatus(Number(stock.quantity))
      }));
    } catch {
      return this.getSampleStocks();
    }
  }

  private saveStocks(): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.stocks));
    } catch {}
  }

  private getSampleStocks(): Stock[] {
    return SAMPLE_STOCKS.map((stock) => ({ ...stock }));
  }

  private isStock(value: unknown): value is Stock {
    if (typeof value !== 'object' || value === null) {
      return false;
    }

    const stock = value as Record<string, unknown>;

    return (
      typeof stock['id'] === 'string' &&
      typeof stock['coconutType'] === 'string' &&
      typeof stock['quantity'] === 'number' &&
      typeof stock['unit'] === 'string' &&
      typeof stock['purchasePrice'] === 'number' &&
      typeof stock['sellingPrice'] === 'number' &&
      typeof stock['status'] === 'string'
    );
  }
}