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
import { Classifier } from '@maurodatamapper/mdm-resources';

export class EditableDataModel {

  deletePending: boolean;
  label: string;
  description: string;
  classifiers: Classifier[] = [];
  aliases: any[] = [];
  visible: boolean;
  waiting: boolean;
  author: any;
  organisation: any;
  validationError: boolean;

  constructor() { }

  show() {

  }
  cancel() {

  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  save(parent: any) { }

}

export class Categories {
  index: number;
  id: string;
  key: string;
  value: string;
  category: string;
}
