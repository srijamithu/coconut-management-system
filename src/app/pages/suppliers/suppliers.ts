import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

interface Supplier {
  id: string;
  name: string;
  mobile: string;
  village: string;
  status: string;
}

@Component({
  selector: 'app-suppliers',
  imports: [FormsModule],
  templateUrl: './suppliers.html',
  styleUrl: './suppliers.scss',
})
export class Suppliers {

  showForm = false;

  private readonly storageKey = 'coconut_supplier';

  private saveSuppliersToLocalStorage(): void {
    localStorage.setItem(
      this.storageKey,
      JSON.stringify(this.suppliers)
    );
  }

  constructor() {
    const savedSuppliers = localStorage.getItem(this.storageKey);

    if (savedSuppliers) {
      this.suppliers = JSON.parse(savedSuppliers) as Supplier[];
    }
  }

  searchText = '';
  currentPage = 1;
  itemsPerPage = 5;

  editingSupplierId: string | null = null;

  suppliers: Supplier[] = [
    {
      id: 'SUP001',
      name: 'Ramesh',
      mobile: '9876543210',
      village: 'vijayawada',
      status: 'Active',
    },
    {
      id: 'SUP002',
      name: 'Suresh',
      mobile: '9876543211',
      village: 'padalanka',
      status: 'Active',
    }
  ];

  newSupplier = {
    name: '',
    mobile: '',
    village: '',
    status: 'Active'
  };

  formErrors = {
    name: '',
    mobile: '',
    village: ''
  };

  get filteredSuppliers(): Supplier[] {
    const query = this.searchText.trim().toLowerCase();

    if (!query) {
      return this.suppliers;
    }

    return this.suppliers.filter(supplier =>
      supplier.name.toLowerCase().includes(query) ||
      supplier.mobile.toLowerCase().includes(query) ||
      supplier.village.toLowerCase().includes(query)
    );
  }

  get totalPages(): number {
    return Math.ceil(this.filteredSuppliers.length / this.itemsPerPage);
  }

  get paginatedSuppliers(): Supplier[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;

    return this.filteredSuppliers.slice(
      startIndex,
      startIndex + this.itemsPerPage
    );
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  openForm(): void {
    this.resetForm();
    this.showForm = true;
  }

  editSupplier(supplier: Supplier): void {
    this.editingSupplierId = supplier.id;
    
    this.newSupplier = {
      name: supplier.name,
      mobile: supplier.mobile,
      village: supplier.village,
      status: supplier.status
    };

    this.formErrors = {
      name: '',
      mobile: '',
      village: ''
    };

    this.showForm = true;
    }
  

  closeForm(): void {
    this.showForm = false;
    this.resetForm();
  }

  resetForm(): void {
    this.editingSupplierId = null;
    this.newSupplier = {
      name: '',
      mobile: '',
      village: '',
      status: 'Active'
    };
    this.formErrors = {
      name: '',
      mobile: '',
      village: ''
    };
  }

  saveSupplier(): void {

    // this.saveSuppliersToLocalStorage();
    if (!this.validateSupplier()) {
      return;
    }

    if (this.editingSupplierId) {
      const index = this.suppliers.findIndex(
        supplier => supplier.id === this.editingSupplierId
      );

      if (index !== -1) {
        this.suppliers[index] = {
          ...this.suppliers[index],
          ...this.newSupplier,
          id: this.suppliers[index].id
        };
      }
    } else {
      const nextId = this.suppliers.reduce((max, supplier) => {
        const idNumber = Number(supplier.id.replace('SUP', ''));
        return Number.isNaN(idNumber) ? max : Math.max(max, idNumber);
      }, 0) + 1;

      const supplier: Supplier = {
        id: 'SUP' + String(nextId).padStart(3, '0'),
        ...this.newSupplier
      };

      this.suppliers.push(supplier);
    }

    this.saveSuppliersToLocalStorage();

    this.closeForm();
  }

  deleteSupplier(supplier: Supplier): void {
    const confirmed = confirm(
      `Are you sure you want to delete ${supplier.name}?`
    );

    if (confirmed) {
      this.suppliers = this.suppliers.filter(
        item => item.id !== supplier.id
      );

      this.saveSuppliersToLocalStorage();

      if (this.currentPage > this.totalPages) {
        this.currentPage = Math.max(1, this.totalPages);
      
      }
    }

    this.suppliers = this.suppliers.filter(
      item => item.id !== supplier.id
    );

    this.saveSuppliersToLocalStorage();

    if (this.currentPage > this.totalPages) {
      this.currentPage = Math.max(1, this.totalPages);
    }

    if (confirmed) {
      this.suppliers = this.suppliers.filter(
        item => item.id !== supplier.id
      );

      const newTotalPages = Math.ceil(
        this.filteredSuppliers.length / this.itemsPerPage
      );

      if (this.currentPage > newTotalPages) {
        this.currentPage = Math.max(1, newTotalPages);
      }
    }
  }
  private validateSupplier(): boolean {
    const errors = {
      name: '',
      mobile: '',
      village: ''
    };

    if (!this.newSupplier.name.trim()) {
      errors.name = 'Supplier name is required.';
    }

    const mobile = this.newSupplier.mobile.trim();

    if (!mobile) {
      errors.mobile = 'Mobile number is required.';
    } else if (!/^\d{10}$/.test(mobile)) {
      errors.mobile = 'Mobile number must be exactly 10 digits.';
    }

    if (!this.newSupplier.village.trim()) {
      errors.village = 'Village is required.';
    }

    this.formErrors = errors;

    return !errors.name && !errors.mobile && !errors.village;
  }
}
