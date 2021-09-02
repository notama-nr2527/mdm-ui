/*
Copyright 2020-2021 University of Oxford
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
import { Component, Input, ViewChild, AfterViewInit, ChangeDetectorRef, EventEmitter, ElementRef, ViewChildren, Output } from '@angular/core';
import { MdmResourcesService } from '@mdm/modules/resources';
import { forkJoin, merge, Observable } from 'rxjs';
import { catchError, map, startWith, switchMap } from 'rxjs/operators';
import { MdmPaginatorComponent } from '@mdm/shared/mdm-paginator/mdm-paginator';
import { MatTableDataSource } from '@angular/material/table';
import { ReferenceDataElement, ReferenceDataElementIndexResponse, ReferenceDataModelDetail, ReferenceDataValue, ReferenceDataValueRow, ReferenceDataValueSearchQueryParameters, ReferenceDataValueTableResponse } from '@maurodatamapper/mdm-resources';

interface ReferenceDataTableRow {
  [key: string]: ReferenceDataValue;
}

@Component({
  selector: 'mdm-reference-data-values',
  templateUrl: './reference-data-values.component.html',
  styleUrls: ['./reference-data-values.component.scss']
})
export class ReferenceDataValuesComponent implements AfterViewInit {
  @Input() parent: ReferenceDataModelDetail;
  @Output() totalCount = new EventEmitter<string>();
  @ViewChild(MdmPaginatorComponent, { static: true }) paginator: MdmPaginatorComponent;
  @ViewChildren('filters', { read: ElementRef }) filters: ElementRef[];

  dataSource = new MatTableDataSource<ReferenceDataTableRow>();
  records: ReferenceDataTableRow[] = [];
  displayedColumns: string[];
  totalItemCount = 0;
  isLoadingResults = true;
  hideFilters = true;
  searchTerm = '';
  filterEvent = new EventEmitter<any>();
  filter: {};

  constructor(
    private changeRef: ChangeDetectorRef,
    private resources: MdmResourcesService  ) {
    this.dataSource = new MatTableDataSource(this.records);
  }

  ngAfterViewInit() {
    this.loadReferenceDataValues();
  }

  loadReferenceDataValues() {
    this.changeRef.detectChanges();
    this.filterEvent.subscribe(() => (this.paginator.pageIndex = 0));

    merge(this.paginator.page, this.filterEvent)
      .pipe(
        startWith({}),
        switchMap(() => {
          this.isLoadingResults = true;

          return forkJoin([
            this.elementsFetch(),
            this.contentFetch(this.paginator.pageSize, this.paginator.pageOffset, this.filter)
          ]);
        }),
        map(([elements, values]) => {
          this.setDisplayColumns(elements.body.items);

          this.totalItemCount = values.body.count;
          this.totalCount.emit(String(values.body.count));
          this.isLoadingResults = false;
          return values.body.rows;
        }),
        catchError(() => {
          this.isLoadingResults = false;
          return [];
        })
      ).subscribe((rows: ReferenceDataValueRow[]) => {
        this.setValuesToDataSource(rows);
      });

    this.changeRef.detectChanges();
  }

  toggleSearch() {
    this.hideFilters = !this.hideFilters;
    this.loadReferenceDataValues();
  }

  applyFilter() {
    const filter = {};
    this.filters.forEach((x: any) => {
      const name = x.nativeElement.name;
      const value = x.nativeElement.value;
      if (value !== '') {
        filter[name] = value;
      }
    });
    this.filter = filter;
    this.filterEvent.emit(filter);
  }

  contentFetch(pageSize?: number, pageIndex?: number, filters?: any): Observable<ReferenceDataValueTableResponse> {
    let query: ReferenceDataValueSearchQueryParameters = {
      max: pageSize,
      offset: pageIndex,
      asRows: true
    };

    if (filters) {
      query.search = this.searchTerm;
    }

    if (this.hideFilters) {
      return this.resources.referenceDataValue.list(this.parent.id, query);
    }

    return this.resources.referenceDataValue.search(this.parent.id, query);
  }

  elementsFetch(): Observable<ReferenceDataElementIndexResponse> {
    return this.resources.referenceDataElement.list(this.parent.id, { all: true });
  }

  private setDisplayColumns(elements: ReferenceDataElement[]) {
    this.displayedColumns = elements.map(element => element.label);
  }

  private setValuesToDataSource(rows: ReferenceDataValueRow[]) {
    this.records = rows.map(row => {
      // Flatten each endpoint item to make the table rows tabular and not an object hierarchy
      return row.columns.reduce<ReferenceDataTableRow>((acc, column) => {
        return {
          ...acc,
          [column.referenceDataElement.label]: column
        };
      }, {});
    });

    this.dataSource.data = this.records;
  }
}
