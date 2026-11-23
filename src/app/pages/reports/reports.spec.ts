import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Reports } from './reports';

const sampleSales = [
  {
    id: 'SAL001',
    customerName: 'Ramesh',
    coconutType: 'Mature Coconut',
    quantity: 100,
    unit: 'Pieces',
    sellingPrice: 20,
    totalAmount: 2000,
    saleDate: '2026-11-17',
  },
  {
    id: 'SAL002',
    customerName: 'Suresh',
    coconutType: 'Tender Coconut',
    quantity: 50,
    unit: 'Pieces',
    sellingPrice: 30,
    totalAmount: 1500,
    saleDate: '2026-11-18',
  },
];

describe('Reports', () => {
  let component: Reports;
  let fixture: ComponentFixture<Reports>;

  const createComponent = async (): Promise<void> => {
    fixture = TestBed.createComponent(Reports);
    component = fixture.componentInstance;
    await fixture.whenStable();
  };

  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [Reports],
    }).compileComponents();
  });

  it('should create', async () => {
    await createComponent();
    expect(component).toBeTruthy();
  });

  it('should total the sample sales and count both transactions', async () => {
    localStorage.setItem('coconut_sales', JSON.stringify(sampleSales));
    await createComponent();

    expect(component.totalSales).toBe(3500);
    expect(component.formattedTotalSales).toBe('3,500');
    expect(component.totalTransactions).toBe(2);
  });

  it('should order the latest sales newest first', async () => {
    localStorage.setItem('coconut_sales', JSON.stringify(sampleSales));
    await createComponent();

    expect(component.latestSales.map((sale) => sale.id)).toEqual([
      'SAL002',
      'SAL001',
    ]);
  });

  it('should report zero totals when no sales are stored', async () => {
    await createComponent();

    expect(component.totalSales).toBe(0);
    expect(component.totalTransactions).toBe(0);
    expect(component.latestSales).toEqual([]);
  });
});
