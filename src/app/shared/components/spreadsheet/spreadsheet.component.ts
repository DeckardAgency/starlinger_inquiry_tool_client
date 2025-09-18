import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import * as XLSX from 'xlsx';
import { SpreadsheetRow, TabType, ExportOptions } from './spreadsheet.interface';

@Component({
  selector: 'app-spreadsheet',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './spreadsheet.component.html',
  styleUrls: ['./spreadsheet.component.scss']
})
export class SpreadsheetComponent implements OnInit {
  @Output() dataChanged = new EventEmitter<SpreadsheetRow[]>();

  activeTab: TabType = 'client';
  statusMessage: string = '';
  isSuccess: boolean = false;
  isExpanded: boolean = false;

  // Demo data matching the design image
  demoData: SpreadsheetRow[] = [
    { pieces: '8', item: 'ANCS-05001', name: 'Hexagon screw' },
    { pieces: '16', item: 'ANSK-03000', name: 'Washer' },
    { pieces: '24', item: 'ANSK-12345', name: 'Power panel T30' },
    { pieces: '10', item: 'ANSK-90000', name: 'DC converter' },
    { pieces: '300', item: 'POUBM-1231', name: 'Power module 5000W' }
  ];

  // Client data - starts with empty rows
  clientData: SpreadsheetRow[] = [];

  ngOnInit(): void {
    this.initializeClientData();
    this.emitData();
  }

  /**
   * Initialize client data with empty rows
   */
  private initializeClientData(): void {
    this.clientData = [];
    // Create initial empty rows for client data entry
    for (let i = 0; i < 10; i++) {
      this.clientData.push({
        pieces: '',
        item: '',
        name: ''
      });
    }
  }

  /**
   * Emit current data to parent component
   */
  private emitData(): void {
    const currentData = this.getCurrentData();
    // Filter out completely empty rows before emitting
    const filteredData = currentData.filter(row =>
      row.pieces || row.item || row.name
    );
    this.dataChanged.emit(filteredData);
  }

  /**
   * Switch between demo and client data tabs
   */
  switchTab(tab: TabType): void {
    this.activeTab = tab;
    this.clearStatusMessage();
    this.emitData();
  }

  /**
   * Get current data based on active tab
   */
  getCurrentData(): SpreadsheetRow[] {
    return this.activeTab === 'demo' ? [...this.demoData] : [...this.clientData];
  }

  /**
   * Handle data changes and auto-add rows
   */
  onDataChange(rowIndex?: number): void {
    // Check if we need to add more rows (when user is typing in penultimate row)
    if (this.activeTab === 'client' && rowIndex !== undefined) {
      this.checkAndAddRow(rowIndex);
    }

    // Use setTimeout to ensure the model is updated before emitting
    setTimeout(() => {
      this.emitData();
    }, 0);
  }

  /**
   * Check if user is entering data in penultimate row and add a new row if needed
   */
  private checkAndAddRow(currentRowIndex: number): void {
    const totalRows = this.clientData.length;
    const penultimateRowIndex = totalRows - 2;

    // If user is typing in the penultimate row
    if (currentRowIndex === penultimateRowIndex) {
      const currentRow = this.clientData[currentRowIndex];

      // Check if the current row has any data
      if (currentRow.pieces || currentRow.item || currentRow.name) {
        // Check if the last row is empty (to avoid adding duplicate empty rows)
        const lastRow = this.clientData[totalRows - 1];
        if (lastRow.pieces || lastRow.item || lastRow.name) {
          // Last row has data, so add a new empty row
          this.addRow();
        }
      }
    }
  }

  /**
   * Add new row (internal use only)
   */
  private addRow(): void {
    if (this.activeTab === 'client') {
      this.clientData.push({
        pieces: '',
        item: '',
        name: ''
      });
    }
  }

  /**
   * Remove row (client data only) - keeping for potential future use
   */
  removeRow(index: number): void {
    if (this.activeTab === 'client' && this.clientData.length > 1) {
      this.clientData.splice(index, 1);
      this.emitData();
    }
  }

  /**
   * Toggle fullscreen/expanded view
   */
  toggleFullscreen(): void {
    this.isExpanded = !this.isExpanded;

    // Add or remove fullscreen class to body to handle scrolling
    if (this.isExpanded) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }

  /**
   * Exit fullscreen with Escape key
   */
  onEscapeKey(): void {
    if (this.isExpanded) {
      this.toggleFullscreen();
    }
  }

  /**
   * Export current data to Excel file
   */
  exportToExcel(options: ExportOptions = {}): void {
    try {
      const currentData = this.getCurrentData();
      const dataToExport = this.prepareExportData(currentData);

      // Create workbook and worksheet
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.aoa_to_sheet(dataToExport);

      // Set column widths for better formatting
      ws['!cols'] = [
        { width: 15 },
        { width: 20 },
        { width: 30 }
      ];

      // Add worksheet to workbook
      const sheetName = options.sheetName || 'Starlinger Parts Request';
      XLSX.utils.book_append_sheet(wb, ws, sheetName);

      // Generate filename
      const filename = this.generateFilename(options);

      // Save file
      XLSX.writeFile(wb, filename);

      this.showStatusMessage(`Excel file "${filename}" exported successfully!`, true);
    } catch (error) {
      console.error('Export failed:', error);
      this.showStatusMessage('Failed to export Excel file. Please try again.', false);
    }
  }

  /**
   * Prepare data for Excel export
   */
  private prepareExportData(data: SpreadsheetRow[]): any[][] {
    const exportData: any[][] = [];

    // Add header
    exportData.push(['Starlinger part request template', '', '']);
    exportData.push(['Piece(s)', 'Item', 'Name']);

    // Add data entries - filter out completely empty entries
    const nonEmptyData = data.filter(row =>
      row.pieces || row.item || row.name
    );

    nonEmptyData.forEach(row => {
      exportData.push([row.pieces || '', row.item || '', row.name || '']);
    });

    return exportData;
  }

  /**
   * Generate filename for export
   */
  private generateFilename(options: ExportOptions): string {
    const baseFilename = options.filename || 'Starlinger_Parts_Request';
    const tabSuffix = this.activeTab;

    if (options.includeTimestamp !== false) {
      const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
      return `${baseFilename}_${tabSuffix}_${timestamp}.xlsx`;
    }

    return `${baseFilename}_${tabSuffix}.xlsx`;
  }

  /**
   * Show status message with auto-clear
   */
  private showStatusMessage(message: string, success: boolean): void {
    this.statusMessage = message;
    this.isSuccess = success;
    setTimeout(() => this.clearStatusMessage(), 5000);
  }

  /**
   * Clear status message
   */
  private clearStatusMessage(): void {
    this.statusMessage = '';
    this.isSuccess = false;
  }
}
