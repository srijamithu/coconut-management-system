import { Component } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';

interface Customer {
  id: string;
  name: string;
  mobile: string;
  village: string;
  address: string;
  status: string;
}

const SAMPLE_CUSTOMERS: Customer[] = [
  {
    id: 'CUS001',
    name: 'Ravi Kumar',
    mobile: '9876543210',
    village: 'Palmaner',
    address: 'Main Road',
    status: 'Active'
  },
  {
    id: 'CUS002',
    name: 'Suresh',
    mobile: '9876543211',
    village: 'Chittoor',
    address: 'Market Street',
    status: 'Active'
  },
  {
    id: 'CUS003',
    name: 'Anitha',
    mobile: '9876543212',
    village: 'Narasapuram',
    address: 'Temple Street',
    status: 'Inactive'
  },
  {
    id: 'CUS004',
    name: 'Vijay',
    mobile: '9876543213',
    village: 'Bhimavaram',
    address: 'Station Road',
    status: 'Active'
  },
  {
    id: 'CUS005',
    name: 'Lakshmi',
    mobile: '9876543214',
    village: 'Palakollu',
    address: 'Canal Street',
    status: 'Active'
  },
  {
    id: 'CUS006',
    name: 'Kiran',
    mobile: '9876543215',
    village: 'Eluru',
    address: 'College Road',
    status: 'Active'
  },
  {
    id: 'CUS007',
    name: 'Divya',
    mobile: '9876543216',
    village: 'Kovvur',
    address: 'Riverside Road',
    status: 'Inactive'
  },
  {
    id: 'CUS008',
    name: 'Manoj',
    mobile: '9876543217',
    village: 'Tadepalligudem',
    address: 'Bypass Road',
    status: 'Active'
  },
  {
    id: 'CUS009',
    name: 'Sneha',
    mobile: '9876543218',
    village: 'Nidadavole',
    address: 'Old Bus Stand',
    status: 'Active'
  },
  {
    id: 'CUS010',
    name: 'Arun',
    mobile: '9876543219',
    village: 'Palmaner',
    address: 'Gandhi Road',
    status: 'Active'
  },
  {
    id: 'CUS011',
    name: 'Pooja',
    mobile: '9876543220',
    village: 'Chittoor',
    address: 'Fish Market Street',
    status: 'Inactive'
  },
  {
    id: 'CUS012',
    name: 'Naveen',
    mobile: '9876543221',
    village: 'Narasapuram',
    address: 'GNT Road',
    status: 'Active'
  }
];

@Component({
  selector: 'app-customers',
  imports: [FormsModule],
  templateUrl: './customers.html',
  styleUrl: './customers.scss'
})
export class Customers {

  private readonly storageKey = 'coconut_customers';

  readonly pageSize = 5;
  currentPage = 1;

  showForm = false;
  editingCustomerId: string | null = null;

  customers: Customer[] = this.loadCustomers();

  private _searchText = '';

  get searchText(): string {
    return this._searchText;
  }

  set searchText(value: string) {
    this._searchText = value;
    this.currentPage = 1;
  }

  get filteredCustomers(): Customer[] {
    const search = this.searchText.trim().toLowerCase();

    if (!search) {
      return this.customers;
    }

    return this.customers.filter(
      (customer) =>
        customer.name.toLowerCase().includes(search) ||
        customer.mobile.toLowerCase().includes(search) ||
        customer.village.toLowerCase().includes(search)
    );
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.filteredCustomers.length / this.pageSize));
  }

  get pagedCustomers(): Customer[] {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    return this.filteredCustomers.slice(
      startIndex,
      startIndex + this.pageSize
    );
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
    return Math.min(
      this.currentPage * this.pageSize,
      this.filteredCustomers.length
    );
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

  newCustomer = {
    name: '',
    mobile: '',
    village: '',
    address: '',
    status: 'Active'
  };

  formErrors = {
    name: '',
    mobile: '',
    village: ''
  };

  openForm() {
    this.editingCustomerId = null;
    this.resetForm();
    this.showForm = true;
  }

  editCustomer(customer: Customer) {
    this.editingCustomerId = customer.id;
    this.newCustomer = {
      name: customer.name,
      mobile: customer.mobile,
      village: customer.village,
      address: customer.address,
      status: customer.status
    };
    this.resetErrors();
    this.showForm = true;
  }

  closeForm() {
    this.showForm = false;
    this.editingCustomerId = null;
    this.resetForm();
  }

  saveCustomer(form: NgForm) {
    if (!this.validateCustomer()) {
      form.control.markAllAsTouched();
      return;
    }

    if (this.editingCustomerId) {
      const index = this.customers.findIndex(
        (customer) => customer.id === this.editingCustomerId
      );

      if (index !== -1) {
        this.customers[index] = {
          ...this.customers[index],
          ...this.newCustomer
        };
      }

      this.ensureValidPage();
    } else {
      const nextId = this.customers.reduce((max, customer) => {
        const idNumber = Number(customer.id.replace('CUS', ''));
        return Number.isNaN(idNumber) ? max : Math.max(max, idNumber);
      }, 0) + 1;

      const customer: Customer = {
        id: 'CUS' + String(nextId).padStart(3, '0'),
        ...this.newCustomer
      };

      this.customers.push(customer);
      this.currentPage = this.totalPages;
    }

    this.saveCustomers();
    this.closeForm();
  }

  deleteCustomer(id: string) {
    const confirmed = window.confirm(
      'Are you sure you want to delete this customer?'
    );

    if (!confirmed) {
      return;
    }

    this.customers = this.customers.filter((customer) => customer.id !== id);
    this.ensureValidPage();
    this.saveCustomers();
  }

  private ensureValidPage(): void {
    if (this.currentPage > this.totalPages) {
      this.currentPage = this.totalPages;
    }
  }

  private loadCustomers(): Customer[] {
    try {
      const stored = localStorage.getItem(this.storageKey);

      if (!stored) {
        return this.getSampleCustomers();
      }

      const parsed: unknown = JSON.parse(stored);

      if (!Array.isArray(parsed)) {
        return this.getSampleCustomers();
      }

      return parsed.filter((customer): customer is Customer =>
        this.isCustomer(customer)
      );
    } catch {
      return this.getSampleCustomers();
    }
  }

  private saveCustomers(): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.customers));
    } catch {}
  }

  private getSampleCustomers(): Customer[] {
    return SAMPLE_CUSTOMERS.map((customer) => ({ ...customer }));
  }

  private isCustomer(value: unknown): value is Customer {
    if (typeof value !== 'object' || value === null) {
      return false;
    }

    const customer = value as Record<string, unknown>;

    return (
      typeof customer['id'] === 'string' &&
      typeof customer['name'] === 'string' &&
      typeof customer['mobile'] === 'string' &&
      typeof customer['village'] === 'string' &&
      typeof customer['address'] === 'string' &&
      typeof customer['status'] === 'string'
    );
  }

  private resetForm() {
    this.newCustomer = {
      name: '',
      mobile: '',
      village: '',
      address: '',
      status: 'Active'
    };
    this.resetErrors();
  }

  private resetErrors() {
    this.formErrors = {
      name: '',
      mobile: '',
      village: ''
    };
  }

  private validateCustomer(): boolean {
    const errors = {
      name: '',
      mobile: '',
      village: ''
    };

    if (!this.newCustomer.name.trim()) {
      errors.name = 'Customer name is required.';
    }

    const mobile = this.newCustomer.mobile.trim();

    if (!mobile) {
      errors.mobile = 'Mobile number is required.';
    } else if (!/^\d{10}$/.test(mobile)) {
      errors.mobile = 'Mobile number must be exactly 10 digits.';
    }

    if (!this.newCustomer.village.trim()) {
      errors.village = 'Village is required.';
    }

    this.formErrors = errors;

    return !errors.name && !errors.mobile && !errors.village;
  }

}
