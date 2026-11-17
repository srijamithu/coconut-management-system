import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NgForm } from '@angular/forms';

import { Customers } from './customers';

const STORAGE_KEY = 'coconut_customers';

describe('Customers', () => {
  let component: Customers;
  let fixture: ComponentFixture<Customers>;

  const mockForm = {
    control: { markAllAsTouched: () => {} }
  } as unknown as NgForm;

  beforeEach(async () => {
    localStorage.clear();

    await TestBed.configureTestingModule({
      imports: [Customers],
    }).compileComponents();

    fixture = TestBed.createComponent(Customers);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show 5 customers per page', () => {
    expect(component.pageSize).toBe(5);
    expect(component.customers.length).toBe(12);
    expect(component.pagedCustomers.length).toBe(5);
    expect(component.totalPages).toBe(3);
  });

  it('should navigate between pages and stay within bounds', () => {
    expect(component.isFirstPage).toBe(true);

    component.previousPage();
    expect(component.currentPage).toBe(1);

    component.nextPage();
    expect(component.currentPage).toBe(2);

    component.nextPage();
    expect(component.currentPage).toBe(3);
    expect(component.isLastPage).toBe(true);

    component.nextPage();
    expect(component.currentPage).toBe(3);

    component.previousPage();
    expect(component.currentPage).toBe(2);
  });

  it('should render pagination controls below the table', () => {
    const pagination = fixture.nativeElement.querySelector('.pagination');
    expect(pagination).toBeTruthy();

    const info = pagination.querySelector('.page-info');
    expect(info.textContent.trim()).toBe('Page 1 of 3');

    const buttons = pagination.querySelectorAll('.page-button');
    expect(buttons.length).toBe(2);
    expect(buttons[0].disabled).toBe(true);
    expect(buttons[1].disabled).toBe(false);
  });

  it('should reset to page 1 when a new search is entered', () => {
    component.nextPage();
    expect(component.currentPage).toBe(2);

    component.searchText = 'Ravi';
    expect(component.currentPage).toBe(1);
    expect(component.filteredCustomers.length).toBe(1);
    expect(component.pagedCustomers.length).toBe(1);
  });

  it('should search customers by name, mobile number and village', () => {
    component.searchText = 'anitha';
    expect(component.filteredCustomers.map((customer) => customer.id))
      .toEqual(['CUS003']);

    component.searchText = '9876543214';
    expect(component.filteredCustomers.map((customer) => customer.id))
      .toEqual(['CUS005']);

    component.searchText = 'Palmaner';
    expect(component.filteredCustomers.map((customer) => customer.id))
      .toEqual(['CUS001', 'CUS010']);
  });

  it('should show a friendly message when no customers match the search', () => {
    component.searchText = 'zzz-no-match';
    fixture.detectChanges();

    expect(component.filteredCustomers.length).toBe(0);
    expect(component.totalPages).toBe(1);

    const emptyCell = fixture.nativeElement.querySelector('.empty-state');
    expect(emptyCell).toBeTruthy();
    expect(emptyCell.textContent).toContain('No customers found');

    const pagination = fixture.nativeElement.querySelector('.pagination');
    expect(pagination).toBeFalsy();
  });

  it('should keep the customer when deletion is cancelled', () => {
    vi.spyOn(window, 'confirm').mockReturnValue(false);

    const before = component.customers.length;
    component.deleteCustomer('CUS001');

    expect(component.customers.length).toBe(before);
    expect(component.customers.some((customer) => customer.id === 'CUS001'))
      .toBe(true);
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
  });

  it('should move to a valid page when the last page becomes empty after delete', () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);

    component.nextPage();
    component.nextPage();
    expect(component.currentPage).toBe(3);

    component.deleteCustomer('CUS011');
    component.deleteCustomer('CUS012');

    expect(component.customers.length).toBe(10);
    expect(component.totalPages).toBe(2);
    expect(component.currentPage).toBe(2);
    expect(component.pagedCustomers.length).toBe(5);

    const stored = JSON.parse(
      localStorage.getItem(STORAGE_KEY) ?? '[]'
    ) as Array<{ id: string }>;
    expect(stored.length).toBe(10);
    expect(stored.some((customer) => customer.id === 'CUS012')).toBe(false);
  });

  it('should add a customer with the next auto-generated id and persist it', () => {
    component.newCustomer = {
      name: 'New Customer',
      mobile: '9000000013',
      village: 'Test Village',
      address: 'Test Address',
      status: 'Active'
    };

    component.saveCustomer(mockForm);

    expect(component.customers.length).toBe(13);
    expect(component.customers[12].id).toBe('CUS013');
    expect(component.currentPage).toBe(component.totalPages);
    expect(component.showForm).toBe(false);
    expect(component.newCustomer.name).toBe('');

    const stored = JSON.parse(
      localStorage.getItem(STORAGE_KEY) ?? '[]'
    ) as Array<{ id: string; name: string }>;
    expect(stored.length).toBe(13);
    expect(stored.some((customer) => customer.name === 'New Customer'))
      .toBe(true);
  });

  it('should reject invalid customer details', () => {
    component.newCustomer = {
      name: '',
      mobile: '123',
      village: '',
      address: '',
      status: 'Active'
    };

    component.saveCustomer(mockForm);

    expect(component.customers.length).toBe(12);
    expect(component.formErrors.name).toBe('Customer name is required.');
    expect(component.formErrors.mobile).toBe(
      'Mobile number must be exactly 10 digits.'
    );
    expect(component.formErrors.village).toBe('Village is required.');
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
  });

  it('should save updated customer details to localStorage', () => {
    component.editCustomer(component.customers[0]);
    component.newCustomer.name = 'Ravi Kumar Updated';
    component.newCustomer.village = 'Updated Village';
    component.saveCustomer(mockForm);

    const stored = JSON.parse(
      localStorage.getItem(STORAGE_KEY) ?? '[]'
    ) as Array<{ id: string; name: string; village: string }>;
    const updated = stored.find((customer) => customer.id === 'CUS001');

    expect(component.customers[0].name).toBe('Ravi Kumar Updated');
    expect(updated?.name).toBe('Ravi Kumar Updated');
    expect(updated?.village).toBe('Updated Village');
  });

  it('should load saved customers from localStorage instead of sample data', async () => {
    const savedCustomers = [
      {
        id: 'CUS900',
        name: 'Saved Customer',
        mobile: '9000000000',
        village: 'Saved Village',
        address: 'Saved Address',
        status: 'Active'
      }
    ];
    const savedJson = JSON.stringify(savedCustomers);
    localStorage.setItem(STORAGE_KEY, savedJson);

    const savedFixture = TestBed.createComponent(Customers);
    const savedComponent = savedFixture.componentInstance;
    savedFixture.detectChanges();
    await savedFixture.whenStable();

    expect(savedComponent.customers.length).toBe(1);
    expect(savedComponent.customers[0].name).toBe('Saved Customer');
    expect(localStorage.getItem(STORAGE_KEY)).toBe(savedJson);
  });

  it('should fall back to sample customers when saved data is invalid', async () => {
    localStorage.setItem(STORAGE_KEY, '{not valid json');

    const invalidFixture = TestBed.createComponent(Customers);
    const invalidComponent = invalidFixture.componentInstance;
    invalidFixture.detectChanges();
    await invalidFixture.whenStable();

    expect(invalidComponent.customers.length).toBe(12);
    expect(invalidComponent.customers[0].id).toBe('CUS001');
  });

  it('should persist add, edit and delete across component re-initialization', () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);

    component.newCustomer = {
      name: 'Persistent Customer',
      mobile: '9111111111',
      village: 'Persist Village',
      address: 'Persist Address',
      status: 'Active'
    };
    component.saveCustomer(mockForm);

    let refreshed = TestBed.createComponent(Customers).componentInstance;
    const added = refreshed.customers.find(
      (customer) => customer.name === 'Persistent Customer'
    );
    expect(added).toBeTruthy();

    refreshed.editCustomer(added!);
    refreshed.newCustomer.name = 'Persistent Customer Updated';
    refreshed.saveCustomer(mockForm);

    refreshed = TestBed.createComponent(Customers).componentInstance;
    expect(refreshed.customers.find((customer) => customer.id === added!.id)?.name)
      .toBe('Persistent Customer Updated');

    refreshed.deleteCustomer(added!.id);

    refreshed = TestBed.createComponent(Customers).componentInstance;
    expect(refreshed.customers.some((customer) => customer.id === added!.id))
      .toBe(false);
    expect(refreshed.customers.length).toBe(12);
  });
});
