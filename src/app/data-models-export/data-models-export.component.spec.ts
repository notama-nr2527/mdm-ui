/*
Copyright 2020 University of Oxford

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
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DataModelsExportComponent } from './data-models-export.component';
import { TestModule } from '@mdm/modules/test/test.module';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { ProfilePictureComponent } from '@mdm/shared/profile-picture/profile-picture.component';
import { ByteArrayToBase64Pipe } from '@mdm/pipes/byte-array-to-base64.pipe';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ModelSelectorTreeComponent } from '@mdm/model-selector-tree/model-selector-tree.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { FoldersTreeModule } from '@mdm/folders-tree/folders-tree.module';
import { FormsModule } from '@angular/forms';
import { FilterPipe } from '@mdm/directives/filter-pipe.directive';
import { ToastrModule } from 'ngx-toastr';
import { UIRouterModule } from '@uirouter/angular';
import { MdmResourcesService } from '@mdm/modules/resources';
import { MatDialogModule } from '@angular/material/dialog';
import { empty } from 'rxjs';

describe('DataModelsExportComponent', () => {
  let component: DataModelsExportComponent;
  let fixture: ComponentFixture<DataModelsExportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        // TestModule
        NgxSkeletonLoaderModule,
        MatTooltipModule,
        MatFormFieldModule,
        MatSelectModule,
        MatOptionModule,
        MatProgressBarModule,
        MatDialogModule,
        FoldersTreeModule,
        FormsModule,
        UIRouterModule.forRoot({ useHash: true }),
        ToastrModule.forRoot()
      ],
      providers: [
        {
          provide: MdmResourcesService,
          useValue: {
            session: {
              isAuthenticated: () => empty()
            },
            tree: {
              list: jest.fn()
            }
          }
        }
      ],
      declarations: [
        ProfilePictureComponent,
        ByteArrayToBase64Pipe,
        FilterPipe,
        ModelSelectorTreeComponent,
        DataModelsExportComponent
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DataModelsExportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
