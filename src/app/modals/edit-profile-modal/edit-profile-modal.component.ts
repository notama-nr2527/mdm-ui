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

/* eslint-disable id-blacklist */
import { Component, Inject, OnInit } from '@angular/core';
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA
} from '@angular/material/dialog';
import { ProfileModalDataModel } from '@mdm/model/profilerModalDataModel';
import { MdmResourcesService } from '@mdm/modules/resources';
import { ElementSelectorComponent } from '@mdm/utility/element-selector.component';
import { MarkdownParserService } from '@mdm/utility/markdown/markdown-parser/markdown-parser.service';
import { MarkupDisplayModalComponent } from '../markup-display-modal/markup-display-modal.component';
@Component({
  selector: 'mdm-edit-profile-modal',
  templateUrl: './edit-profile-modal.component.html',
  styleUrls: ['./edit-profile-modal.component.scss']
})
export class EditProfileModalComponent implements OnInit {
  profileData: any;
  elementDialogue: any;
  selectedElement: any;
  errors: any;

  saveInProgress = false;

  formOptionsMap = {
    Integer: 'number',
    String: 'text',
    Boolean: 'checkbox',
    boolean: 'checkbox',
    int: 'number',
    date: 'date',
    time: 'time',
    datetime: 'datetime',
    decimal: 'number'
  };

  constructor(
    public dialogRef: MatDialogRef<EditProfileModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ProfileModalDataModel,
    private markdownParser: MarkdownParserService,
    protected resourcesSvc: MdmResourcesService,
    private dialog: MatDialog
  ) {
    data.profile.sections.forEach((section) => {
      section.fields.forEach((field) => {
        if (field.dataType !== null) {
          field.dataType = field.dataType.toLowerCase();
        }
        if (data.isNew) {
          if (field.defaultValue) {
            field.currentValue = field.defaultValue;
          }
        }

        if (field.dataType === 'datetime') {
          if (
            field.currentValue &&
            field.currentValue.length > 0
          ) {
            const dateTime = new Date(field.currentValue);
              field.date = dateTime.toLocaleDateString();
              field.time = dateTime.toTimeString();
          }
        }

        if (field.dataType === 'folder') {
          if (
            field.currentValue === '[]' ||
            field.currentValue === '""' ||
            field.currentValue === ''
          ) {
            field.currentValue = null;
          } else {
            field.currentValue = JSON.parse(field.currentValue);
          }
        }
      });
    });

    this.profileData = data.profile;
  }

  ngOnInit(): void {}

  save() {
    // Save Changes

    const returnData = JSON.parse(JSON.stringify(this.profileData));

    returnData.sections.forEach((section) => {
      section.fields.forEach((field) => {
        if (
          field.dataType === 'folder' &&
          field.currentValue &&
          field.currentValue.length > 0
        ) {
          field.currentValue = JSON.stringify(field.currentValue);
        }

        if (
          field.dataType === 'datetime' &&
          field.date &&
          field.date.length > 0
        ) {
          field.currentValue =  new Date(`${new Date(field.date).toDateString()} ${field.time}`);
        }
      });
    });

    this.dialogRef.close(returnData);
  }

  onCancel() {
    this.dialogRef.close();
  }

  showInfo(field: any) {
    this.dialog.open(MarkupDisplayModalComponent, {
      data: {
        content: field.description,
        title: field.fieldName
      }
    });
  }

  validate() {
    const data = JSON.parse(JSON.stringify(this.profileData));
    this.resourcesSvc.profile
      .validateProfile(
        this.data.profile.namespace,
        this.data.profile.name,
        this.data.catalogueItem.domainType,
        this.data.catalogueItem.id,
        data
      )
      .subscribe((result) => {
        result.body.sections.forEach((section) => {
          section.fields.forEach((field) => {
            if (field.dataType !== null) {
              field.dataType = field.dataType.toLowerCase();
            }
          });
        });
        this.profileData = result.body;
      });
  }

  showAddElementToMarkdown = (field) => {
    const dg = this.dialog.open(ElementSelectorComponent, {
      data: { validTypesToSelect: ['DataModel'], notAllowedToSelectIds: [] },
      panelClass: 'element-selector-modal'
    });

    dg.afterClosed().subscribe((dgData) => {
      this.markdownParser.createMarkdownLink(dgData).then((mkData) => {
        field.currentValue = mkData;
      });
    });
  };
}
