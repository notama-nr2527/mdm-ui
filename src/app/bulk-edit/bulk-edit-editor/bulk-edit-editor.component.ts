/*
Copyright 2020-2022 University of Oxford
and Health and Social Care Information Centre, also known as NHS Digital

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

SPDX-License-Identifier: Apache-2.0
*/
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ProfileField } from '@maurodatamapper/mdm-resources';
import { MessageHandlerService } from '@mdm/services';
import {
  CellClassParams,
  CellClassRules,
  CellValueChangedEvent,
  ColDef,
  ColGroupDef,
  ColumnApi,
  GridApi,
  GridOptions,
  GridReadyEvent
} from 'ag-grid-community';
import { EMPTY } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { BulkEditDataRow, BulkEditProfileContext } from '../bulk-edit.types';
import { CheckboxCellRendererComponent } from './cell-renderers/checkbox-cell-renderer/checkbox-cell-renderer.component';
import { DateCellEditorComponent } from './cell-editors/date-cell-editor/date-cell-editor.component';
import { BulkEditProfileService } from '../bulk-edit-profile.service';
import {
  MauroItem,
  MauroProfileUpdatePayload,
  MauroProfileValidationResult,
  NavigatableProfile
} from '@mdm/mauro/mauro-item.types';
import { PathCellRendererComponent } from './cell-renderers/path-cell-renderer/path-cell-renderer.component';
import { MarkdownCellEditorComponent } from './cell-editors/markdown-cell-editor/markdown-cell-editor.component';
import { MarkdownEditOverlayComponent } from './overlays/markdown-edit-overlay/markdown-edit-overlay.component';

@Component({
  selector: 'mdm-bulk-edit-editor',
  templateUrl: './bulk-edit-editor.component.html',
  styleUrls: ['./bulk-edit-editor.component.scss']
})
export class BulkEditEditorComponent implements OnInit {
  @Input() rootItem: MauroItem;

  @Output() backEvent = new EventEmitter<void>();

  /** Two-way binding */
  @Input() tab: BulkEditProfileContext;
  @Output() tabChanged = new EventEmitter();

  /**
   * Register custom components to the grid by name.
   */
  frameworkComponents = {
    checkboxCellRenderer: CheckboxCellRendererComponent,
    dateCellEditor: DateCellEditorComponent,
    pathCellRenderer: PathCellRendererComponent,
    markdownCellEditor: MarkdownCellEditorComponent,
    markdownEditOverlay: MarkdownEditOverlayComponent
  };

  validated: MauroProfileValidationResult[];
  totalValidationErrors = 0;
  loaded = false;
  columns: ColGroupDef[] = [];
  rows: BulkEditDataRow[] = [];
  cellRules: CellClassRules = {
    'mdm-bulk-editor__invalid': (params) => this.showValidationError(params),
    'mdm-bulk-editor__readonly': (params) =>
      !params.colDef.editable &&
      params.colDef.cellRenderer !== 'checkboxCellRenderer'
  };

  defaultColDef: ColDef = {
    minWidth: 200
  };

  /** TESTING ONLY! For experimenting with text editing features */
  textEditStyle: 'cell-editor' | 'excel-like' | 'grid-overlay' = 'grid-overlay';
  currentTextValue: string;

  gridOptions: GridOptions = {
    onCellClicked: (event) => {
      if (event.colDef.cellRendererParams.editWithSingularEditor) {
        if (this.textEditStyle === 'excel-like') {
          this.currentTextValue = event.value;
        } else if (this.textEditStyle === 'grid-overlay') {
          console.log(event);
          this.gridOptions.loadingOverlayComponentParams = {
            value: event.value,
            node: event.node,
            column: event.column
          };
          this.gridApi.showLoadingOverlay();
        }
      }
    }
  };

  private gridApi: GridApi;
  private gridColumnApi: ColumnApi;

  constructor(
    private messageHandler: MessageHandlerService,
    private bulkEditProfiles: BulkEditProfileService
  ) {}

  ngOnInit(): void {
    this.load();
  }

  load() {
    this.bulkEditProfiles
      .getMany(this.rootItem, this.tab.identifiers, this.tab.profileProvider)
      .pipe(
        catchError((error) => {
          this.messageHandler.showError(
            'There was a problem loading the profiles.',
            error
          );
          return EMPTY;
        })
      )
      .subscribe((profiles) => {
        this.tab.editedProfiles = profiles;
        this.columns = this.getColumnsForProfile(profiles[0]);
        this.rows = profiles.map((profile) => this.mapProfileToRow(profile));

        this.validate();
        this.loaded = true;
      });
  }

  onGridReady(event: GridReadyEvent) {
    this.gridApi = event.api;
    this.gridColumnApi = event.columnApi;
    this.screenResize();
  }

  back() {
    this.backEvent.emit();
  }

  onCellValueChanged(event: CellValueChangedEvent) {
    const data = event.data as BulkEditDataRow;
    data.profile.sections.forEach((section) => {
      section.fields.forEach((field) => {
        if (field.metadataPropertyName === event.colDef.field) {
          field.currentValue = event.newValue;
        }
      });
    });
  }

  validate() {
    this.totalValidationErrors = 0;

    this.bulkEditProfiles
      .validateMany(
        this.rootItem,
        this.tab.profileProvider,
        this.tab.editedProfiles
      )
      .subscribe((results) => {
        this.validated = results;
        this.totalValidationErrors = this.validated.reduce((current, next) => {
          return current + (next.errors?.length ?? 0);
        }, 0);
        // Trigger grid redraw at correct time
        setTimeout(() => this.gridApi?.redrawRows(), 0);
      });
  }

  save() {
    const payloads: MauroProfileUpdatePayload[] = this.tab.editedProfiles.map(
      (profile) => {
        return {
          profile,
          identifier: this.tab.identifiers.find(
            (identifier) => identifier.id === profile.id
          )
        };
      }
    );

    this.bulkEditProfiles
      .saveMany(this.rootItem, this.tab.profileProvider, payloads)
      .pipe(
        catchError((error) => {
          this.messageHandler.showError(
            `There was a problem saving changes for '${this.tab.displayName}'.`,
            error
          );
          return EMPTY;
        })
      )
      .subscribe(() => {
        this.messageHandler.showSuccess(
          `'${this.tab.displayName}' was saved successfully.`
        );
      });
  }

  showValidationError(params: CellClassParams): boolean {
    if (!this.validated) {
      return false;
    }

    const data = params.data as BulkEditDataRow;
    let hasError = false;

    this.validated.forEach((validationResult) => {
      if (
        validationResult.profile.label === data.label &&
        validationResult.errors
      ) {
        validationResult.errors.forEach((error) => {
          if (error.metadataPropertyName === params.colDef.field) {
            hasError = true;
          }
        });
      }
    });

    return hasError;
  }

  private screenResize() {
    const columnIds = this.gridColumnApi
      .getAllColumns()
      .map((col) => col.getColId());

    this.excludeAutoResizeColumns(columnIds);
    this.gridColumnApi.autoSizeColumns(columnIds);
  }

  private excludeAutoResizeColumns(columnIds) {
    const pathColKey = 'Path';
    const pathId = this.gridColumnApi.getColumn(pathColKey).getColId();
    const pathIndex = columnIds.indexOf(pathId);
    if (pathIndex > -1) {
      columnIds.splice(pathIndex, 1);
    }
  }

  private getColumnsForProfile(profile: NavigatableProfile): ColGroupDef[] {
    const elementGroup: ColGroupDef = {
      children: [
        {
          headerName: 'Item',
          field: 'label',
          pinned: 'left'
        },
        {
          headerName: 'Path',
          field: 'path',
          cellRenderer: 'pathCellRenderer',
          cellRendererParams: { profile },
          resizable: true,
          pinned: 'left'
        }
      ]
    };

    const profileGroups = profile.sections.map((section) => {
      return {
        headerName: section.name,
        children: section.fields.map((field) =>
          this.getColumnForProfileField(field)
        )
      };
    });

    return [elementGroup, ...profileGroups];
  }

  private getColumnForProfileField(field: ProfileField): ColDef {
    const column: ColDef = {
      headerTooltip: field.description,
      headerName: field.fieldName,
      field: field.metadataPropertyName,
      editable: !field.uneditable,
      cellClassRules: this.cellRules
    };

    if (field.dataType === 'boolean') {
      column.cellRenderer = 'checkboxCellRenderer';
      column.editable = false;
      column.cellStyle = { textAlign: 'center' };
    }

    if (field.dataType === 'date') {
      column.cellEditor = 'dateCellEditor';
    }

    if (field.dataType === 'enumeration') {
      column.cellEditor = 'agSelectCellEditor';
      column.cellEditorParams = {
        values: [''].concat(field.allowedValues.sort())
      };
    }

    if (field.dataType === 'model') {
      column.editable = false;
      column.valueGetter = (params) =>
        params.data[field.metadataPropertyName].label;
    }

    if (field.dataType === 'text' && this.textEditStyle === 'cell-editor') {
      column.cellEditor = 'markdownCellEditor';
      column.cellEditorPopup = true;
      column.cellEditorPopupPosition = 'under';
      column.suppressKeyboardEvent = (params) => {
        return params.event.key === 'Enter';
      };
    }

    if (field.dataType === 'text' && this.textEditStyle === 'excel-like') {
      column.editable = false;
      column.cellRendererParams = {
        editWithSingularEditor: true
      };
    }

    if (field.dataType === 'text' && this.textEditStyle === 'grid-overlay') {
      //column.editable = false;
      column.cellRendererParams = {
        editWithSingularEditor: true
      };
    }

    return column;
  }

  private mapProfileToRow(profile: NavigatableProfile): BulkEditDataRow {
    const data = {};
    profile.sections.forEach((section) => {
      section.fields.forEach((field) => {
        data[field.metadataPropertyName] = field.currentValue;
      });
    });

    return {
      label: profile.label,
      profile,
      ...data
    };
  }
}
