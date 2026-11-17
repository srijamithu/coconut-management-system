import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Suppliers } from './suppliers';

describe('Suppliers', () => {
  let component: Suppliers;
  let fixture: ComponentFixture<Suppliers>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Suppliers],
    }).compileComponents();

    fixture = TestBed.createComponent(Suppliers);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should open the modal form when Add Supplier is clicked', () => {
    expect(fixture.nativeElement.querySelector('.form-overlay')).toBeFalsy();

    const addButton = fixture.nativeElement.querySelector(
      '.page-header .add-button'
    ) as HTMLButtonElement;
    addButton.click();
    fixture.detectChanges();

    expect(component.showForm).toBe(true);

    const overlay = fixture.nativeElement.querySelector('.form-overlay');
    expect(overlay).toBeTruthy();
    expect(overlay.querySelectorAll('.supplier-form input').length).toBe(3);
    expect(overlay.querySelector('.supplier-form select')).toBeTruthy();
  });

  it('should add a supplier with a sequential ID and render it in the table', async () => {
    const addButton = fixture.nativeElement.querySelector(
      '.page-header .add-button'
    ) as HTMLButtonElement;
    addButton.click();

    component.newSupplier = {
      name: 'New Supplier',
      mobile: '9000000001',
      village: 'Test Village',
      status: 'Active'
    };
    component.saveSupplier();

    await fixture.whenStable();

    expect(component.showForm).toBe(false);
    expect(component.suppliers.length).toBe(3);
    expect(component.suppliers[2].id).toBe('SUP003');

    const rows = fixture.nativeElement.querySelectorAll('tbody tr');
    expect(rows.length).toBe(3);
    expect(rows[2].textContent).toContain('SUP003');
    expect(rows[2].textContent).toContain('New Supplier');
  });

  it('should not generate duplicate supplier IDs', () => {
    component.openForm();
    component.newSupplier = {
      name: 'First Supplier',
      mobile: '9000000001',
      village: 'Village One',
      status: 'Active'
    };
    component.saveSupplier();

    component.openForm();
    component.newSupplier = {
      name: 'Second Supplier',
      mobile: '9000000002',
      village: 'Village Two',
      status: 'Inactive'
    };
    component.saveSupplier();

    const ids = component.suppliers.map((supplier) => supplier.id);

    expect(ids).toEqual(['SUP001', 'SUP002', 'SUP003', 'SUP004']);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('should update an existing supplier without creating a duplicate row', async () => {
    const originalId = component.suppliers[0].id;

    component.editSupplier(component.suppliers[0]);

    expect(component.showForm).toBe(true);
    expect(component.editingSupplierId).toBe(originalId);
    expect(component.newSupplier.name).toBe('Ramesh');

    component.newSupplier.name = 'Ramesh Kumar';
    component.saveSupplier();

    await fixture.whenStable();

    expect(component.showForm).toBe(false);
    expect(component.suppliers.length).toBe(2);
    expect(component.suppliers[0].id).toBe(originalId);
    expect(component.suppliers[0].name).toBe('Ramesh Kumar');

    const rows = fixture.nativeElement.querySelectorAll('tbody tr');
    expect(rows.length).toBe(2);
  });

  it('should delete a supplier only when the confirmation is accepted', () => {
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false);

    component.deleteSupplier(component.suppliers[0]);

    expect(component.suppliers.length).toBe(2);
    expect(confirmSpy).toHaveBeenCalledWith(
      'Are you sure you want to delete Ramesh?'
    );

    confirmSpy.mockReturnValue(true);
    component.deleteSupplier(component.suppliers[0]);

    expect(component.suppliers.length).toBe(1);
    expect(component.suppliers[0].id).toBe('SUP002');

    confirmSpy.mockRestore();
  });

  it('should validate required fields and mobile number', () => {
    component.openForm();
    component.saveSupplier();

    expect(component.suppliers.length).toBe(2);
    expect(component.showForm).toBe(true);
    expect(component.formErrors.name).toContain('required');
    expect(component.formErrors.mobile).toContain('required');
    expect(component.formErrors.village).toContain('required');

    component.newSupplier.name = 'Valid Name';
    component.newSupplier.village = 'Valid Village';
    component.newSupplier.mobile = '12345';
    component.saveSupplier();

    expect(component.suppliers.length).toBe(2);
    expect(component.formErrors.mobile).toContain('10 digits');

    component.newSupplier.mobile = '9000000003';
    component.saveSupplier();

    expect(component.suppliers.length).toBe(3);
    expect(component.showForm).toBe(false);
  });

  it('should close the form and reset fields on cancel', () => {
    component.openForm();
    component.newSupplier.name = 'Half Typed';
    component.newSupplier.mobile = '999';

    component.closeForm();

    expect(component.showForm).toBe(false);
    expect(component.newSupplier.name).toBe('');
    expect(component.newSupplier.mobile).toBe('');
    expect(component.newSupplier.village).toBe('');
    expect(component.newSupplier.status).toBe('Active');
  });

  it('should filter suppliers by name case-insensitively', () => {
    component.searchText = 'ram';
    expect(component.filteredSuppliers.map((supplier) => supplier.id)).toEqual([
      'SUP001'
    ]);

    component.searchText = 'RAM';
    expect(component.filteredSuppliers.map((supplier) => supplier.id)).toEqual([
      'SUP001'
    ]);
  });

  it('should filter suppliers by partial mobile number', () => {
    component.searchText = '543211';

    expect(component.filteredSuppliers.map((supplier) => supplier.id)).toEqual([
      'SUP002'
    ]);
  });

  it('should filter suppliers by village case-insensitively', () => {
    component.searchText = 'VIJAY';

    expect(component.filteredSuppliers.map((supplier) => supplier.id)).toEqual([
      'SUP001'
    ]);
  });

  it('should render "No suppliers found" when nothing matches', async () => {
    component.searchText = 'zzzz';
    fixture.detectChanges();
    await fixture.whenStable();

    expect(component.filteredSuppliers.length).toBe(0);

    const emptyRow = fixture.nativeElement.querySelector('.no-results-row');
    expect(emptyRow).toBeTruthy();
    expect(emptyRow.textContent).toContain('No suppliers found');
  });

  it('should show all suppliers when the search is cleared', () => {
    component.searchText = 'ram';
    expect(component.filteredSuppliers.length).toBe(1);

    component.searchText = '';
    expect(component.filteredSuppliers.length).toBe(2);
  });
});
