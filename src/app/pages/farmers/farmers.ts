import { Component } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';

interface Farmer {
  id: string;
  name: string;
  mobile: string;
  village: string;
  address: string;
  landArea: number;
  status: string;
}

const SAMPLE_FARMERS: Farmer[] = [
  {
    id: 'FAR001',
    name: 'Ramesh',
    mobile: '9876543210',
    village: 'Narasapuram',
    address: 'Main Road',
    landArea: 3.5,
    status: 'Active'
  },
  {
    id: 'FAR002',
    name: 'Suresh',
    mobile: '9876543211',
    village: 'Bhimavaram',
    address: 'Market Road',
    landArea: 2,
    status: 'Active'
  },
  {
    id: 'FAR003',
    name: 'Krishna',
    mobile: '9876543212',
    village: 'Palakollu',
    address: 'Temple Street',
    landArea: 4.5,
    status: 'Inactive'
  },
  {
    id: 'FAR004',
    name: 'Lakshmi',
    mobile: '9876543213',
    village: 'Tadepalligudem',
    address: 'Station Road',
    landArea: 5.2,
    status: 'Active'
  },
  {
    id: 'FAR005',
    name: 'Venkatesh',
    mobile: '9876543214',
    village: 'Eluru',
    address: 'College Road',
    landArea: 1.8,
    status: 'Active'
  },
  {
    id: 'FAR006',
    name: 'Anjali',
    mobile: '9876543215',
    village: 'Narasapuram',
    address: 'Fish Market Street',
    landArea: 2.6,
    status: 'Active'
  },
  {
    id: 'FAR007',
    name: 'Prasad',
    mobile: '9876543216',
    village: 'Bhimavaram',
    address: 'GNT Road',
    landArea: 6,
    status: 'Inactive'
  },
  {
    id: 'FAR008',
    name: 'Geetha',
    mobile: '9876543217',
    village: 'Palakollu',
    address: 'Canal Street',
    landArea: 3.1,
    status: 'Active'
  },
  {
    id: 'FAR009',
    name: 'Ravi',
    mobile: '9876543218',
    village: 'Kovvur',
    address: 'Riverside Road',
    landArea: 4,
    status: 'Active'
  },
  {
    id: 'FAR010',
    name: 'Padmavathi',
    mobile: '9876543219',
    village: 'Nidadavole',
    address: 'Old Bus Stand',
    landArea: 2.2,
    status: 'Active'
  },
  {
    id: 'FAR011',
    name: 'Srinivas',
    mobile: '9876543220',
    village: 'Tadepalligudem',
    address: 'Bypass Road',
    landArea: 5.5,
    status: 'Active'
  },
  {
    id: 'FAR012',
    name: 'Meena',
    mobile: '9876543221',
    village: 'Eluru',
    address: 'Sanitary Road',
    landArea: 1.5,
    status: 'Inactive'
  },
  {
    id: 'FAR013',
    name: 'Harish',
    mobile: '9876543222',
    village: 'Kovvur',
    address: 'Gandhi Road',
    landArea: 3.8,
    status: 'Active'
  }
];

@Component({
  selector: 'app-farmers',
  imports: [FormsModule],
  templateUrl: './farmers.html',
  styleUrl: './farmers.scss'
})
export class Farmers {

  private readonly storageKey = 'coconut_farmers';

  readonly pageSize = 5;
  currentPage = 1;

  showForm = false;
  editingFarmerId: string | null = null;
  selectedFarmer: Farmer | null = null;

  farmers: Farmer[] = this.loadFarmers();

  private _searchText = '';

  get searchText(): string {
    return this._searchText;
  }

  set searchText(value: string) {
    this._searchText = value;
    this.currentPage = 1;
  }

  get filteredFarmers(): Farmer[] {
    const search = this.searchText.trim().toLowerCase();

    if (!search) {
      return this.farmers;
    }

    return this.farmers.filter(
      (farmer) =>
        farmer.name.toLowerCase().includes(search) ||
        farmer.mobile.toLowerCase().includes(search) ||
        farmer.village.toLowerCase().includes(search)
    );
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.filteredFarmers.length / this.pageSize));
  }

  get pagedFarmers(): Farmer[] {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    return this.filteredFarmers.slice(
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
      this.filteredFarmers.length
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

  newFarmer = {
    name: '',
    mobile: '',
    village: '',
    address: '',
    landArea: 0,
    status: 'Active'
  };

  formErrors = {
    name: '',
    mobile: '',
    village: '',
    landArea: ''
  };

  openForm() {
    this.editingFarmerId = null;
    this.resetForm();
    this.showForm = true;
  }

  editFarmer(farmer: Farmer) {
    this.editingFarmerId = farmer.id;
    this.newFarmer = {
      name: farmer.name,
      mobile: farmer.mobile,
      village: farmer.village,
      address: farmer.address,
      landArea: farmer.landArea,
      status: farmer.status
    };
    this.resetErrors();
    this.showForm = true;
  }

  closeForm() {
    this.showForm = false;
    this.editingFarmerId = null;
    this.resetForm();
  }

  viewFarmer(farmer: Farmer) {
    this.selectedFarmer = farmer;
  }

  closeDetails() {
    this.selectedFarmer = null;
  }

  saveFarmer(form: NgForm) {
    if (!this.validateFarmer()) {
      form.control.markAllAsTouched();
      return;
    }

    if (this.editingFarmerId) {
      const index = this.farmers.findIndex(
        (farmer) => farmer.id === this.editingFarmerId
      );

      if (index !== -1) {
        this.farmers[index] = {
          ...this.farmers[index],
          ...this.newFarmer
        };
      }

      this.ensureValidPage();
    } else {
      const nextId = this.farmers.reduce((max, farmer) => {
        const idNumber = Number(farmer.id.replace('FAR', ''));
        return Number.isNaN(idNumber) ? max : Math.max(max, idNumber);
      }, 0) + 1;

      const farmer: Farmer = {
        id: 'FAR' + String(nextId).padStart(3, '0'),
        ...this.newFarmer
      };

      this.farmers.push(farmer);
      this.currentPage = this.totalPages;
    }

    this.saveFarmers();
    this.closeForm();
  }

  deleteFarmer(id: string) {
    const confirmed = window.confirm(
      'Are you sure you want to delete this farmer?'
    );

    if (!confirmed) {
      return;
    }

    this.farmers = this.farmers.filter((farmer) => farmer.id !== id);
    this.ensureValidPage();
    this.saveFarmers();
  }

  private ensureValidPage(): void {
    if (this.currentPage > this.totalPages) {
      this.currentPage = this.totalPages;
    }
  }

  private loadFarmers(): Farmer[] {
    try {
      const stored = localStorage.getItem(this.storageKey);

      if (!stored) {
        return this.getSampleFarmers();
      }

      const parsed: unknown = JSON.parse(stored);

      if (!Array.isArray(parsed)) {
        return this.getSampleFarmers();
      }

      return parsed.filter((farmer): farmer is Farmer =>
        this.isFarmer(farmer)
      );
    } catch {
      return this.getSampleFarmers();
    }
  }

  private saveFarmers(): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.farmers));
    } catch {}
  }

  private getSampleFarmers(): Farmer[] {
    return SAMPLE_FARMERS.map((farmer) => ({ ...farmer }));
  }

  private isFarmer(value: unknown): value is Farmer {
    if (typeof value !== 'object' || value === null) {
      return false;
    }

    const farmer = value as Record<string, unknown>;

    return (
      typeof farmer['id'] === 'string' &&
      typeof farmer['name'] === 'string' &&
      typeof farmer['mobile'] === 'string' &&
      typeof farmer['village'] === 'string' &&
      typeof farmer['address'] === 'string' &&
      typeof farmer['landArea'] === 'number' &&
      typeof farmer['status'] === 'string'
    );
  }

  private resetForm() {
    this.newFarmer = {
      name: '',
      mobile: '',
      village: '',
      address: '',
      landArea: 0,
      status: 'Active'
    };
    this.resetErrors();
  }

  private resetErrors() {
    this.formErrors = {
      name: '',
      mobile: '',
      village: '',
      landArea: ''
    };
  }

  private validateFarmer(): boolean {
    const errors = {
      name: '',
      mobile: '',
      village: '',
      landArea: ''
    };

    if (!this.newFarmer.name.trim()) {
      errors.name = 'Farmer name is required.';
    }

    const mobile = this.newFarmer.mobile.trim();

    if (!mobile) {
      errors.mobile = 'Mobile number is required.';
    } else if (!/^\d{10}$/.test(mobile)) {
      errors.mobile = 'Mobile number must be exactly 10 digits.';
    }

    if (!this.newFarmer.village.trim()) {
      errors.village = 'Village is required.';
    }

    const landArea = Number(this.newFarmer.landArea);

    if (!this.newFarmer.landArea || Number.isNaN(landArea) || landArea <= 0) {
      errors.landArea = 'Land area must be greater than 0.';
    }

    this.formErrors = errors;

    return !errors.name && !errors.mobile && !errors.village && !errors.landArea;
  }

}