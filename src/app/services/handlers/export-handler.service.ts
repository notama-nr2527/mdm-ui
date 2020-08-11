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
import { Injectable } from '@angular/core';
import { MdmResourcesService } from '@mdm/modules/resources';

@Injectable({
  providedIn: 'root'
})
export class ExportHandlerService {

  constructor(private resources: MdmResourcesService) { }

  createFileName(label, exporter) {
    const extension = exporter.fileExtension ? exporter.fileExtension : 'json';
    const rightNow = new Date();
    const res = rightNow.toISOString().slice(0, 19).replace(/-/g, '').replace(/:/g, '');
    // remove space from dataModelLabel and replace all spaces with _ and also add date/time and extension
    return label.trim().toLowerCase().split(' ').join('_') + '_' + res + '.' + extension;
  }

  exportDataModel(dataModels, exporter) {

    let modelIds = [];
    dataModels.forEach(dm => {
      modelIds.push(dm.id);
    });

    return this.resources.dataModel.exportModels(exporter.namespace, exporter.name, exporter.version, modelIds);
  }

  exportDataModel2(dataModels, exporter) {
    let modelIds = [];
    dataModels.forEach(dm => {
      modelIds.push(dm.id);
    });
    this.resources.dataModel.exportModels(exporter.namespace, exporter.name, exporter.version, modelIds).subscribe(fileBlob => {
      const label = dataModels.length === 1 ? dataModels[0].label : 'data_model_export';
      const fileName = this.createFileName(label, exporter);
      return ({ fileBlob, fileName });
    }, error => {
      return error;
    });
    return null;
  }

  createBlobLink(blob, fileName) {
    // http://jsbin.com/kelijatigo/edit?html,js,output
    // https://github.com/keeweb/keeweb/issues/130
    const url = (window.URL || window.webkitURL).createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', fileName);
    const linkText = document.createTextNode(fileName);
    link.appendChild(linkText);
    link.setAttribute('title', fileName);
    // DO NOT set target!!!!!
    // link.setAttribute('target', '_blank');
    return link;
  }
}
