import { Component, OnInit, Input, Output, EventEmitter, ViewChild, ElementRef, AfterViewInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AgGridModule } from 'ag-grid-angular';
import { AgGridAngular } from 'ag-grid-angular';
import {
  ColDef,
  GridApi,
  GridOptions,
  GridReadyEvent,
  CellValueChangedEvent,
  ModuleRegistry,
  ClientSideRowModelModule,
  RowApiModule
} from 'ag-grid-community';

// Register required modules
ModuleRegistry.registerModules([
  ClientSideRowModelModule,
  RowApiModule
]);

@Component({
    selector: 'app-spreadsheet',
    imports: [CommonModule, AgGridModule],
    template: `
    <div class="spreadsheet-container" [class.fullscreen]="isFullscreen">
      <div class="spreadsheet-grid-container" #agGridContainer>
        <ag-grid-angular
          #agGrid
          style="width: 100%; height: 100%;"
          class="ag-theme-alpine excel-like"
          [rowData]="rowData"
          [columnDefs]="columnDefs"
          [gridOptions]="gridOptions"
          [rowSelection]="'multiple'"
          (gridReady)="onGridReady($event)"
          (cellValueChanged)="onCellValueChanged($event)">
        </ag-grid-angular>
      </div>

      <!-- Excel-like tabs at the bottom -->
      <div class="spreadsheet-tabs">
        <button
          class="spreadsheet-tab"
          [class.active]="activeTab === 'demo'"
          (click)="setActiveTab('demo')">
          Demo example
        </button>
        <button
          class="spreadsheet-tab"
          [class.active]="activeTab === 'client'"
          (click)="setActiveTab('client')">
          Client data
        </button>

        <!-- Fullscreen toggle button moved to bottom right corner -->
        <div class="spreadsheet-actions">
          <button class="expand-btn" (click)="toggleFullscreen()">
            <span class="material-icons">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M5.33325 10.6667L2.66659 13.3334M2.66659 13.3334H5.33325M2.66659 13.3334V10.6667M10.6666 5.33337L13.3333 2.66671M13.3333 2.66671H10.6666M13.3333 2.66671V5.33337" stroke="#232323" stroke-width="1.33" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </span>
            {{ isFullscreen ? 'Exit Fullscreen' : 'Expand view' }}
          </button>
        </div>
      </div>
    </div>
  `,
    styles: [`
    .spreadsheet-container {
      display: flex;
      flex-direction: column;
      border: 1px solid #E0E0E0;
      border-radius: 6px;
      overflow: hidden;
      background-color: #fff;
      margin-bottom: 24px;
      transition: all 0.3s ease;
      height: 450px; /* Explicit height */
      box-shadow: 0 2px 5px rgba(0,0,0,0.05);
    }

    .spreadsheet-container.fullscreen {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      z-index: 1000;
      border-radius: 0;
    }

    .spreadsheet-grid-container {
      flex: 1;
      min-height: 400px; /* Increased min height */
      width: 100%;     /* Explicit width */
      overflow: hidden;
      display: flex;   /* This helps with child sizing */
    }

    .spreadsheet-container.fullscreen .spreadsheet-grid-container {
      height: calc(100vh - 40px); /* Adjusted for tabs only */
    }

    /* Excel-like tabs at the bottom */
    .spreadsheet-tabs {
      display: flex;
      gap: 0;
      background-color: #F8F9FA;
      padding: 0;
      border-top: 1px solid #E0E0E0;
      height: 36px;
      position: relative;
    }

    .spreadsheet-tab {
      padding: 8px 16px;
      border: none;
      border-right: 1px solid #E0E0E0;
      background-color: #F0F0F0;
      cursor: pointer;
      font-size: 13px;
      transition: all 0.2s ease;
      height: 100%;
    }

    .spreadsheet-tab.active {
      background-color: #FFFFFF;
      border-top: 2px solid #8539DD;
      color: #333;
      font-weight: 500;
    }

    .spreadsheet-tab:hover:not(.active) {
      background-color: #E8E8E8;
    }

    .spreadsheet-actions {
      position: absolute;
      right: 10px;
      top: 4px;
    }

    .expand-btn {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 4px 8px;
      border: 1px solid #E4E4E7;
      border-radius: 4px;
      background-color: #fff;
      cursor: pointer;
      font-size: 12px;
      transition: all 0.2s ease;
    }

    .expand-btn:hover {
      background-color: #F4F4F5;
    }

    /* Excel-like grid styling */
    :host ::ng-deep .ag-theme-alpine.excel-like {
      --ag-background-color: #fff;
      --ag-header-background-color: #F9F9F9;
      --ag-header-foreground-color: #333;
      --ag-header-cell-hover-background-color: #F0F0F0;
      --ag-border-color: #E0E0E0;
      --ag-row-hover-color: rgba(240, 240, 240, 0.4);
      --ag-selected-row-background-color: rgba(66, 133, 244, 0.2);
      --ag-font-size: 14px;
      --ag-font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      --ag-cell-horizontal-padding: 8px;
      --ag-borders: solid;
      --ag-border-radius: 0;
    }

    :host ::ng-deep .ag-theme-alpine.excel-like .ag-header {
      border-bottom: 2px solid #D0D0D0;
    }

    :host ::ng-deep .ag-theme-alpine.excel-like .ag-header-cell {
      font-weight: 600;
      text-transform: none;
      padding-left: 8px;
      padding-right: 8px;
    }

    :host ::ng-deep .ag-theme-alpine.excel-like .ag-cell {
      line-height: 40px;
      padding-left: 8px;
      padding-right: 8px;
      border-right: 1px solid #E0E0E0;
      border-bottom: 1px solid #E0E0E0;
    }

    :host ::ng-deep .ag-theme-alpine.excel-like .ag-ltr .ag-cell:first-of-type {
      border-left: 1px solid #E0E0E0;
    }

    :host ::ng-deep .ag-theme-alpine.excel-like .ag-row {
      border-bottom: none;
    }

    :host ::ng-deep .ag-theme-alpine.excel-like .ag-row-odd {
      background-color: #FCFCFC;
    }

    :host ::ng-deep .ag-theme-alpine.excel-like .ag-row-even {
      background-color: #FFFFFF;
    }

    :host ::ng-deep .ag-theme-alpine.excel-like .ag-cell-focus {
      border: 2px solid #4285F4 !important;
      padding: 2px 6px;
    }

    :host ::ng-deep .ag-theme-alpine.excel-like .ag-header-row {
      height: 40px;
    }

    :host ::ng-deep .ag-theme-alpine.excel-like .ag-row {
      height: 40px;
    }

    :host ::ng-deep .ag-theme-alpine.excel-like .ag-cell-edit-input {
      height: 100%;
      padding: 0 7px;
      font-size: 14px;
    }

    /* Style for non-editable cells */
    :host ::ng-deep .ag-theme-alpine.excel-like .ag-cell.non-editable {
      background-color: #F8F9FA;
      color: #424242;
      font-weight: 500;
    }
  `]
})
export class SpreadsheetComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input() title: string = 'Input data';
  @Input() columnDefs: ColDef[] = [];
  @Input() rowData: any[] = [];
  @Input() isFullscreen: boolean = false;

  @Output() fullscreenToggled = new EventEmitter<boolean>();
  @Output() dataChanged = new EventEmitter<any[]>();

  @ViewChild('agGrid') agGrid!: AgGridAngular;
  @ViewChild('agGridContainer') agGridContainer!: ElementRef<HTMLElement>;

  private gridApi: GridApi | null = null;
  activeTab: string = 'demo';
  private destroyed = false;

  gridOptions: GridOptions = {
    defaultColDef: {
      width: 120,
      minWidth: 120,
      maxWidth: 300,
      resizable: true,
      sortable: false,
      filter: false,
      editable: true
    },
    rowHeight: 40,
    headerHeight: 40,
    animateRows: true,
    enableCellTextSelection: true,
    stopEditingWhenCellsLoseFocus: true,
    rowDragManaged: false,
    suppressDragLeaveHidesColumns: true,
    rowStyle: { 'border-bottom': '1px solid #E0E0E0' },
    suppressColumnVirtualisation: false,
  };

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    // If no column definitions provided, use the default columns
    if (!this.columnDefs || this.columnDefs.length === 0) {
      this.columnDefs = this.generateDefaultColumnDefs();
      console.log('Generated default column defs:', this.columnDefs);
    }

    // Ensure we have some default data if none is provided
    if (!this.rowData || this.rowData.length === 0) {
      // Use setTimeout to ensure Angular change detection works correctly
      setTimeout(() => {
        // this.rowData = this.generateDefaultRowData();
        console.log('Generated default row data:', this.rowData);
        this.cdr.detectChanges();
      });
    }

    // Add window resize event listener
    window.addEventListener('resize', this.onWindowResize.bind(this));
  }

  /**
   * Generate default column definitions based on actual data structure
   */
  private generateDefaultColumnDefs(): ColDef[] {
    return [
      {
        headerName: '#',
        field: 'id',
        width: 70,
        editable: false
      },
      {
        headerName: 'Product (part) name',
        field: 'name',
        width: 200,
        editable: true
      },
      {
        headerName: 'Short description',
        field: 'description',
        width: 300,
        editable: true
      },
      {
        headerName: 'Additional notes',
        field: 'notes',
        width: 300,
        editable: true
      }
    ];
  }

  /**
   * Generate default data
   */
  // private generateDefaultRowData(): any[] {
  //   return [
  //     { id: 1, name: 'Starlinger part request template', description: '', notes: '' },
  //     { id: 2, name: '', description: '', notes: '' },
  //     { id: 3, name: '', description: '', notes: '' },
  //     { id: 4, name: '', description: '', notes: '' }
  //   ];
  // }

  ngAfterViewInit(): void {
    // Nothing needed here
  }

  ngOnDestroy(): void {
    this.destroyed = true;
    window.removeEventListener('resize', this.onWindowResize.bind(this));
  }

  onGridReady(params: GridReadyEvent): void {
    console.log('Grid ready event triggered');
    this.gridApi = params.api;

    // Debug logs
    console.log('Current row data:', this.rowData);
    console.log('Current column defs:', this.columnDefs);
    console.log('API methods available:', Object.keys(params.api));

    // Ensure data is properly displayed using a more aggressive approach
    setTimeout(() => {
      if (this.gridApi) {
        // If rowData is empty but supposed to have default data, generate it now
        if ((!this.rowData || this.rowData.length === 0) && this.gridApi) {
          // this.rowData = this.generateDefaultRowData();
        }

        // Force a hard refresh
        this.gridApi.refreshCells({ force: true });
        this.gridApi.redrawRows();

        // Try also a different approach with rerendering
        const currentData = [...this.rowData];
        this.rowData = [];
        this.cdr.detectChanges();
        this.rowData = currentData;
        this.cdr.detectChanges();
      }
    }, 100);
  }

  onCellValueChanged(event: CellValueChangedEvent): void {
    if (this.destroyed) return;

    // Emit the updated data
    if (this.gridApi) {
      const rowData: any[] = [];
      this.gridApi.forEachNode((node) => {
        if (node.data) {
          rowData.push(node.data);
        }
      });
      this.dataChanged.emit(rowData);
    }
  }

  toggleFullscreen(): void {
    this.isFullscreen = !this.isFullscreen;
    this.fullscreenToggled.emit(this.isFullscreen);

    // Force a layout update
    setTimeout(() => {
      if (this.gridApi) {
        this.gridApi.redrawRows();
      }
    }, 300);
  }

  setActiveTab(tab: string): void {
    this.activeTab = tab;
  }

  /**
   * Public API to resize the grid - just redraws rows
   */
  resizeGrid(): void {
    if (this.gridApi) {
      this.gridApi.redrawRows();
    }
  }

  /**
   * Handle window resize events
   */
  private onWindowResize(): void {
    if (this.destroyed) return;

    // Just redraw rows on resize
    if (this.gridApi) {
      this.gridApi.redrawRows();
    }
  }

  /**
   * Export grid data to Excel
   */
  exportToExcel(): void {
    if (this.gridApi) {
      // Check if exportDataAsExcel is available
      if (typeof this.gridApi['exportDataAsExcel'] === 'function') {
        this.gridApi['exportDataAsExcel']({
          fileName: `${this.title.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}`,
          sheetName: this.activeTab === 'demo' ? 'Demo Example' : 'Client Data'
        });
      } else {
        console.warn('Export to Excel functionality is not available. You may need to register the CSV Export Module.');
      }
    }
  }

  /**
   * Import data from Excel file
   */
  importFromExcel(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      console.log('Importing Excel file:', file.name);
      // Implementation for Excel import would go here
    }
  }

  /**
   * Add a new row to the grid
   */
  addRow(): void {
    if (this.rowData) {
      // Find the highest ID and increment it
      const maxId = Math.max(...this.rowData.map(row => row.id || 0), 0);
      const newRow = { id: maxId + 1, name: '', description: '', notes: '' };

      // Create a new array to trigger change detection
      this.rowData = [...this.rowData, newRow];

      if (this.gridApi) {
        this.gridApi.redrawRows();
      }

      this.cdr.detectChanges();
    }
  }

  /**
   * Method to refresh grid data from parent component
   */
  refreshGridData(): void {
    // Create a new array reference to trigger change detection
    if (this.rowData.length === 0) {
      // this.rowData = this.generateDefaultRowData();
    } else {
      this.rowData = [...this.rowData];
    }

    // After updating the reference, force a redraw if the grid is ready
    if (this.gridApi) {
      this.gridApi.refreshCells({ force: true });
      this.gridApi.redrawRows();
    }

    this.cdr.detectChanges();
  }
}
