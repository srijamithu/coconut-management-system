import { Component } from '@angular/core';

interface Sale {
  id: string;
  customerName: string;
  coconutType:string;
  quantity: number;
  unit: string;
  sellingPrice: number;
  totalAmount: number;
  saleDate: string;
}

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

interface Payment {
  id: string;
  customerName: string;
  saleId: string;
  amount: number;
  paymentMethod: string;
  paymentDate: string;
  status: string;
}

@Component({
  selector: 'app-reports',
  imports: [],
  templateUrl: './reports.html',
  styleUrl: './reports.scss',
})
export class Reports {

  private readonly storageKey = 'coconut_sales';
  private readonly purchaseStorageKey = 'coconut_purchases';
  private readonly paymentStorageKey = 'coconut_payments';

  sales: Sale[] = [];
  purchases: Purchase[] = [];
  payments: Payment[] = [];

  constructor() {
    this.loadSales();
     this.loadPurchases();
     this.loadPayments();
  }

  private loadSales(): void {
    try{
      const savedSales = localStorage.getItem(this.storageKey);

      if (savedSales) {
        const parsed: unknown =JSON.parse(savedSales);

        if (Array.isArray(parsed)) {
          this.sales = parsed;
        }
      }
    } catch {
      console.error('Unable to load sales reports.');
      this.sales = [];
    }
  }

  private loadPurchases(): void {
  try {
    const savedPurchases = localStorage.getItem(
      this.purchaseStorageKey
    );

    if (savedPurchases) {
      const parsed: unknown = JSON.parse(savedPurchases);

      if (Array.isArray(parsed)) {
        this.purchases = parsed;
      }
    }
  } catch {
    console.error('Unable to load purchase reports.');
    this.purchases = [];
  }
}

private loadPayments(): void {
  try {
    const savedPayments = localStorage.getItem(
      this.paymentStorageKey
    );

    if (savedPayments) {
      const parsed: unknown = JSON.parse(savedPayments);

      if(Array.isArray(parsed)) {
        this.payments = parsed;
      }
    }
  } catch {
    console.error('Unable to load payment reports.');
    this.payments = [];
  }
}

  get totalSales(): number {
    return this.sales.reduce(
      (total, sale) => total + Number(sale.totalAmount || 0),
      0
    );
  }

  get totalPurchases(): number {
    return this.purchases.reduce(
      (total, purchase) => total + Number(purchase.totalAmount || 0),
      0
    );
  }

  get formattedTotalPurchases(): string {
    return this.totalPurchases.toLocaleString('en-IN');
  }

  get totalTransactions(): number {
    return this.sales.length;
  }

  get totalPurchaseTransactions(): number {
    return this.purchases.length;
  }

  get totalPaymentsReceived(): number {
    return this.payments
    .filter(payment =>
    ['paid', 'partial'].includes(payment.status.toLowerCase())
    )
    .reduce(
      (total, payment) => total + Number(payment.amount || 0),
      0
    );
  }

  get formattedTotalPayments(): string {
    return this.totalPaymentsReceived.toLocaleString('en-IN');
  }

  get latestSales(): Sale[] {
    return [...this.sales]
    .sort((a, b) =>
    b.saleDate.localeCompare(a.saleDate)
  )
  .slice(0, 5);
  }

  get latestPurchases(): Purchase[] {
    return [...this.purchases]
    .sort((a, b) => 
    b.purchaseDate.localeCompare(a.purchaseDate)
  )
  .slice(0, 5);
  }

  get formattedTotalSales(): string {
    return this.totalSales.toLocaleString('en-IN');
  }
}
