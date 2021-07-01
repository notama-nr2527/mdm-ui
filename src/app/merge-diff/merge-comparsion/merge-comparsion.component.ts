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
import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { MergeItem, MergeUsed } from '@maurodatamapper/mdm-resources';
import { FullMergeItem } from '../types/merge-item-type';

@Component({
  selector: 'mdm-merge-comparison',
  templateUrl: './merge-comparison.component.html',
  styleUrls: ['./merge-comparison.component.scss']
})
export class MergeComparisonComponent implements OnInit {

  @Input() mergeItem : FullMergeItem;
  @Input() isCommitting: boolean;

  @Output() cancelCommitEvent = new EventEmitter<MergeItem>();
  @Output() acceptCommitEvent = new EventEmitter<FullMergeItem>();

  constructor() { }

  ngOnInit(): void {
  }

  cancelCommit()
  {
    this.cancelCommitEvent.emit(this.mergeItem);
  }

  acceptCommit(branchUsed: MergeUsed)
  {
     this.mergeItem.branchSelected = branchUsed;
     this.acceptCommitEvent.emit(this.mergeItem);
  }

  public get MergeUsed()
  {
    return MergeUsed;
  }

}
