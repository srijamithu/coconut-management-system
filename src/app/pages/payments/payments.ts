import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

interface Payment {
  id: string;
  customerName: string;
  saleId: string;
  amount: number;
  paymentMethod: string;
  paymentDate: string;
  status: string;
}

const SAMPLE_PAYMENTS: Payment[] = [
  {
    id: 'PAY001',
    customerName: 'Ramesh',
    saleId: 'SAL001',
    amount: 2000,
    paymentMethod: 'Cash',
    paymentDate: '2026-11-17',
    status: 'Paid'
  },
  {
    id: 'PAY002',
    customerName: 'Suresh',
    saleId: 'SAL002',
    amount: 1000,
    paymentMethod: 'UPI',
    paymentDate: '2026-11-18',
    status: 'Partial'
  }
];

@Component({
  selector: 'app-payments',
  imports: [FormsModule],
  templateUrl: './payments.html',
  styleUrl: './payments.scss',
})
export class Payments {
  private readonly storageKey = 'coconut_payments';

  readonly pageSize = 5;
  currentPage = 1;

  showForm = false;
  editingPaymentId: string | null = null;

  payments: Payment[] = this.loadPayments();

  searchText = '';

  newPayment = {
    customerName: '',
    saleId: '',
    amount: 0,
    paymentMethod: 'Cash',
    paymentDate: '',
    status: 'Paid'
  };

  formErrors = {
    customerName: '',
    saleId: '',
    amount: '',
    paymentMethod: '',
    paymentDate: '',
    status: ''
  };

  get filteredPayments(): Payment[] {
    const search = this.searchText.trim().toLowerCase();

    if (!search) {
      return this.payments;
    }

    return this.payments.filter(
      (payment) =>
        payment.id.toLowerCase().includes(search) ||
        payment.customerName.toLowerCase().includes(search) ||
        payment.saleId.toLowerCase().includes(search) ||
        payment.paymentMethod.toLowerCase().includes(search) ||
        payment.status.toLowerCase().includes(search)
    );
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.filteredPayments.length / this.pageSize));
  }

  get paginatedPayments(): Payment[] {
    const startIndex = (this.currentPage - 1) * this.pageSize;

    return this.filteredPayments.slice(startIndex, startIndex + this.pageSize);
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
    return Math.min(this.currentPage * this.pageSize, this.filteredPayments.length);
  }

  onSearchChange(): void {
    this.currentPage = 1;
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  openForm(): void {
    this.resetForm();
    this.showForm = true;
  }

  editPayment(payment: Payment): void {
    this.editingPaymentId = payment.id;

    this.newPayment = {
      customerName: payment.customerName,
      saleId: payment.saleId,
      amount: payment.amount,
      paymentMethod: payment.paymentMethod,
      paymentDate: payment.paymentDate,
      status: payment.status
    };

    this.resetErrors();
    this.showForm = true;
  }

  closeForm(): void {
    this.showForm = false;
    this.resetForm();
  }

  resetForm(): void {
    this.editingPaymentId = null;

    this.newPayment = {
      customerName: '',
      saleId: '',
      amount: 0,
      paymentMethod: 'Cash',
      paymentDate: '',
      status: 'Paid'
    };

    this.resetErrors();
  }

  private resetErrors(): void {
    this.formErrors = {
      customerName: '',
      saleId: '',
      amount: '',
      paymentMethod: '',
      paymentDate: '',
      status: ''
    };
  }

  savePayment(): void {
    if (!this.validatePayment()) {
      return;
    }

    const paymentData = {
      customerName: this.newPayment.customerName.trim(),
      saleId: this.newPayment.saleId.trim(),
      amount: Number(this.newPayment.amount),
      paymentMethod: this.newPayment.paymentMethod,
      paymentDate: this.newPayment.paymentDate,
      status: this.newPayment.status
    };

    if (this.editingPaymentId) {
      const index = this.payments.findIndex(
        (payment) => payment.id === this.editingPaymentId
      );

      if (index !== -1) {
        this.payments[index] = {
          ...this.payments[index],
          ...paymentData
        };
      }

      this.ensureValidPage();
    } else {
      const nextId =
        this.payments.reduce((max, payment) => {
          const idNumber = Number(payment.id.replace('PAY', ''));

          return Number.isNaN(idNumber) ? max : Math.max(max, idNumber);
        }, 0) + 1;

      const payment: Payment = {
        id: 'PAY' + String(nextId).padStart(3, '0'),
        ...paymentData
      };

      this.payments.push(payment);
      this.currentPage = this.totalPages;
    }

    this.savePayments();
    this.closeForm();
  }

  deletePayment(payment: Payment): void {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${payment.id}?`
    );

    if (!confirmed) {
      return;
    }

    this.payments = this.payments.filter((item) => item.id !== payment.id);

    this.ensureValidPage();
    this.savePayments();
  }

  private validatePayment(): boolean {
    const errors = {
      customerName: '',
      saleId: '',
      amount: '',
      paymentMethod: '',
      paymentDate: '',
      status: ''
    };

    if (!this.newPayment.customerName.trim()) {
      errors.customerName = 'Customer name is required.';
    }

    if (!this.newPayment.saleId.trim()) {
      errors.saleId = 'Sale ID is required.';
    }

    const amountValue = this.newPayment.amount as unknown;
    const amount = Number(amountValue);

    if (
      amountValue === null ||
      amountValue === undefined ||
      amountValue === '' ||
      Number.isNaN(amount) ||
      amount <= 0
    ) {
      errors.amount = 'Payment amount must be greater than zero.';
    }

    if (!this.newPayment.paymentMethod) {
      errors.paymentMethod = 'Payment method is required.';
    }

    if (!this.newPayment.paymentDate) {
      errors.paymentDate = 'Payment date is required.';
    }

    if (!this.newPayment.status) {
      errors.status = 'Payment status is required.';
    }

    this.formErrors = errors;

    return !Object.values(errors).some((error) => error !== '');
  }

  private ensureValidPage(): void {
    if (this.currentPage > this.totalPages) {
      this.currentPage = this.totalPages;
    }

    if (this.currentPage < 1) {
      this.currentPage = 1;
    }
  }

  private loadPayments(): Payment[] {
    try {
      const stored = localStorage.getItem(this.storageKey);

      if (stored === null) {
        return this.getSamplePayments();
      }

      const parsed: unknown = JSON.parse(stored);

      if (!Array.isArray(parsed)) {
        return this.getSamplePayments();
      }

      return parsed.filter(
        (payment): payment is Payment => this.isPayment(payment)
      );
    } catch {
      return this.getSamplePayments();
    }
  }

  private savePayments(): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.payments));
    } catch {
      console.error('Unable to save payments.');
    }
  }

  private getSamplePayments(): Payment[] {
    return SAMPLE_PAYMENTS.map((payment) => ({ ...payment }));
  }

  private isPayment(value: unknown): value is Payment {
    if (typeof value !== 'object' || value === null) {
      return false;
    }

    const payment = value as Record<string, unknown>;

    return (
      typeof payment['id'] === 'string' &&
      typeof payment['customerName'] === 'string' &&
      typeof payment['saleId'] === 'string' &&
      typeof payment['amount'] === 'number' &&
      typeof payment['paymentMethod'] === 'string' &&
      typeof payment['paymentDate'] === 'string' &&
      typeof payment['status'] === 'string'
    );
  }
}
