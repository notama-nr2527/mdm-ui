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
import {
  MdmResourcesConfiguration,
  MdmClassifierResource,
  MdmCatalogueItemResource,
  MdmDataClassResource,
  MdmDataElementResource,
  MdmFolderResource,
  MdmTerminologyResource,
  MdmTermResource,
  MdmCatalogueUserResource,
  MdmTreeResource,
  MdmImporterResource,
  MdmAdminResource,
  MdmUserGroupResource,
  MdmAuthenticationResource,
  MdmDataModelResource,
  MdmDataFlowResource,
  MdmHierarchyResource,
  MdmEnumerationValuesResource,
  MdmDataTypeResource,
  MdmPublicResource,
  MdmCodeSetResource,
  MdmFacetsResource,
  MdmMetadataResource
} from '@maurodatamapper/mdm-resources';
import { MdmRestHandlerService } from './mdm-rest-handler.service';

/**
 * Make @mdm-api/resources available through Angular service.
 */
@Injectable()
export class MdmResourcesService {

  /**
   * @param resourcesConfig Customize apiEndpoint.
   * @param restHandler Custom rest requests handler. In this case injecting rest handler that uses Angular's HttpClient.
   */
  constructor(private resourcesConfig: MdmResourcesConfiguration, private restHandler: MdmRestHandlerService) {}

  classifier = new MdmClassifierResource(this.resourcesConfig, this.restHandler);
  terminology = new MdmTerminologyResource(this.resourcesConfig, this.restHandler);
  term = new MdmTermResource(this.resourcesConfig, this.restHandler);
  folder = new MdmFolderResource(this.resourcesConfig, this.restHandler);
  catalogueUser = new MdmCatalogueUserResource(this.resourcesConfig, this.restHandler);
  catalogueItem = new MdmCatalogueItemResource(this.resourcesConfig, this.restHandler);
  userGroup = new MdmUserGroupResource(this.resourcesConfig, this.restHandler);
  enumerationValues = new MdmEnumerationValuesResource(this.resourcesConfig, this.restHandler);
  authentication = new MdmAuthenticationResource(this.resourcesConfig, this.restHandler);
  tree = new MdmTreeResource(this.resourcesConfig, this.restHandler);
  metadata = new MdmMetadataResource(this.resourcesConfig, this.restHandler);
  facets = new MdmFacetsResource(this.resourcesConfig, this.restHandler);
  dataModel = new MdmDataModelResource(this.resourcesConfig, this.restHandler);
  hierarchy = new MdmHierarchyResource(this.resourcesConfig, this.restHandler);
  dataFlow = new MdmDataFlowResource(this.resourcesConfig, this.restHandler);
  dataClass: MdmDataClassResource = new MdmDataClassResource(this.resourcesConfig, this.restHandler);
  dataType = new MdmDataTypeResource(this.resourcesConfig, this.restHandler);
  public = new MdmPublicResource(this.resourcesConfig, this.restHandler);
  admin = new MdmAdminResource(this.resourcesConfig, this.restHandler);
  dataElement: MdmDataElementResource = new MdmDataElementResource(this.resourcesConfig, this.restHandler);
  importer = new MdmImporterResource(this.resourcesConfig, this.restHandler);
  codeSet = new MdmCodeSetResource(this.resourcesConfig, this.restHandler);
}