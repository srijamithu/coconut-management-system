import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NgForm } from '@angular/forms';

import { Farmers } from './farmers';

const STORAGE_KEY = 'coconut_farmers';

describe('Farmers', () => {
  let component: Farmers;
  let fixture: ComponentFixture<Farmers>;

  beforeEach(async () => {
    localStorage.clear();

    await TestBed.configureTestingModule({
      imports: [Farmers],
    }).compileComponents();

    fixture = TestBed.createComponent(Farmers);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show 5 farmers per page', () => {
    fixture.detectChanges();

    expect(component.pageSize).toBe(5);
    expect(component.farmers.length).toBe(13);
    expect(component.pagedFarmers.length).toBe(5);
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
    fixture.detectChanges();

    const pagination = fixture.nativeElement.querySelector('.pagination');
    expect(pagination).toBeTruthy();

    const info = pagination.querySelector('.page-info');
    expect(info.textContent.trim()).toBe('Page 1 of 3');

    const buttons = pagination.querySelectorAll('.page-button');
    expect(buttons.length).toBe(2);
    expect(buttons[0].disabled).toBe(true);
    expect(buttons[1].disabled).toBe(false);
  });

  it('should disable the next button on the last page', () => {
    component.nextPage();
    component.nextPage();
    fixture.detectChanges();

    const buttons = fixture.nativeElement.querySelectorAll('.page-button');
    expect(buttons[0].disabled).toBe(false);
    expect(buttons[1].disabled).toBe(true);
  });

  it('should reset to page 1 when a new search is entered', () => {
    component.nextPage();
    expect(component.currentPage).toBe(2);

    component.searchText = 'Ramesh';
    expect(component.currentPage).toBe(1);
    expect(component.filteredFarmers.length).toBe(1);
    expect(component.pagedFarmers.length).toBe(1);
  });

  it('should paginate filtered search results', () => {
    component.searchText = 'a';

    const matches = component.filteredFarmers.length;
    expect(matches).toBeGreaterThan(5);
    expect(component.pagedFarmers.length).toBe(5);
    expect(component.totalPages).toBe(Math.ceil(matches / 5));

    component.nextPage();
    expect(component.pagedFarmers.length).toBe(5);
    expect(component.pageStart).toBe(6);
  });

  it('should show a friendly message when no farmers match the search', () => {
    component.searchText = 'zzz-no-match';
    fixture.detectChanges();

    expect(component.filteredFarmers.length).toBe(0);
    expect(component.totalPages).toBe(1);

    const emptyCell = fixture.nativeElement.querySelector('.empty-state');
    expect(emptyCell).toBeTruthy();
    expect(emptyCell.textContent).toContain('No farmers match your search');

    const pagination = fixture.nativeElement.querySelector('.pagination');
    expect(pagination).toBeFalsy();
  });

  it('should move to the previous valid page when the last page becomes empty after delete', () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);

    component.nextPage();
    component.nextPage();
    expect(component.currentPage).toBe(3);

    component.deleteFarmer('FAR011');
    component.deleteFarmer('FAR012');
    component.deleteFarmer('FAR013');

    expect(component.farmers.length).toBe(10);
    expect(component.totalPages).toBe(2);
    expect(component.currentPage).toBe(2);
    expect(component.pagedFarmers.length).toBe(5);

    const stored = JSON.parse(
      localStorage.getItem(STORAGE_KEY) ?? '[]'
    ) as Array<{ id: string }>;
    expect(stored.length).toBe(10);
    expect(stored.some((farmer) => farmer.id === 'FAR011')).toBe(false);
  });

  it('should update pagination and show the new farmer when a farmer is added', () => {
    const form = {
      control: { markAllAsTouched: () => {} }
    } as unknown as NgForm;

    component.newFarmer = {
      name: 'New Farmer',
      mobile: '9000000014',
      village: 'Test Village',
      address: '',
      landArea: 1,
      status: 'Active'
    };

    component.saveFarmer(form);

    expect(component.farmers.length).toBe(14);
    expect(component.currentPage).toBe(component.totalPages);
    expect(
      component.pagedFarmers.some((farmer) => farmer.name === 'New Farmer')
    ).toBe(true);

    const stored = JSON.parse(
      localStorage.getItem(STORAGE_KEY) ?? '[]'
    ) as Array<{ name: string }>;
    expect(stored.length).toBe(14);
    expect(stored.some((farmer) => farmer.name === 'New Farmer')).toBe(true);
  });

  it('should save updated farmer details to localStorage', () => {
    const form = {
      control: { markAllAsTouched: () => {} }
    } as unknown as NgForm;

    component.editFarmer(component.farmers[0]);
    component.newFarmer.name = 'Ramesh Updated';
    component.saveFarmer(form);

    const stored = JSON.parse(
      localStorage.getItem(STORAGE_KEY) ?? '[]'
    ) as Array<{ id: string; name: string }>;
    const updated = stored.find((farmer) => farmer.id === 'FAR001');

    expect(component.farmers[0].name).toBe('Ramesh Updated');
    expect(updated?.name).toBe('Ramesh Updated');
  });

  it('should load saved farmers from localStorage instead of sample data', async () => {
    const savedFarmers = [
      {
        id: 'FAR900',
        name: 'Saved Farmer',
        mobile: '9000000000',
        village: 'Saved Village',
        address: 'Saved Address',
        landArea: 2.5,
        status: 'Active'
      }
    ];
    const savedJson = JSON.stringify(savedFarmers);
    localStorage.setItem(STORAGE_KEY, savedJson);

    const savedFixture = TestBed.createComponent(Farmers);
    const savedComponent = savedFixture.componentInstance;
    savedFixture.detectChanges();
    await savedFixture.whenStable();

    expect(savedComponent.farmers.length).toBe(1);
    expect(savedComponent.farmers[0].name).toBe('Saved Farmer');
    expect(localStorage.getItem(STORAGE_KEY)).toBe(savedJson);
  });

  it('should fall back to sample farmers when saved data is invalid JSON', async () => {
    localStorage.setItem(STORAGE_KEY, '{not valid json');

    const invalidFixture = TestBed.createComponent(Farmers);
    const invalidComponent = invalidFixture.componentInstance;
    invalidFixture.detectChanges();
    await invalidFixture.whenStable();

    expect(invalidComponent.farmers.length).toBe(13);
    expect(invalidComponent.farmers[0].id).toBe('FAR001');
  });

  it('should fall back to sample farmers when saved data is not an array', async () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ farmers: [] }));

    const invalidFixture = TestBed.createComponent(Farmers);
    const invalidComponent = invalidFixture.componentInstance;
    invalidFixture.detectChanges();
    await invalidFixture.whenStable();

    expect(invalidComponent.farmers.length).toBe(13);
  });

  it('should persist add, edit and delete across component re-initialization', () => {
    const form = {
      control: { markAllAsTouched: () => {} }
    } as unknown as NgForm;
    vi.spyOn(window, 'confirm').mockReturnValue(true);

    component.newFarmer = {
      name: 'Persistent Farmer',
      mobile: '9111111111',
      village: 'Persist Village',
      address: 'Persist Address',
      landArea: 2,
      status: 'Active'
    };
    component.saveFarmer(form);

    let refreshed = TestBed.createComponent(Farmers).componentInstance;
    const added = refreshed.farmers.find(
      (farmer) => farmer.name === 'Persistent Farmer'
    );
    expect(added).toBeTruthy();

    refreshed.editFarmer(added!);
    refreshed.newFarmer.name = 'Persistent Farmer Updated';
    refreshed.saveFarmer(form);

    refreshed = TestBed.createComponent(Farmers).componentInstance;
    expect(refreshed.farmers.find((farmer) => farmer.id === added!.id)?.name)
      .toBe('Persistent Farmer Updated');

    refreshed.deleteFarmer(added!.id);

    refreshed = TestBed.createComponent(Farmers).componentInstance;
    expect(refreshed.farmers.some((farmer) => farmer.id === added!.id)).toBe(false);
    expect(refreshed.farmers.length).toBe(13);
  });
});
