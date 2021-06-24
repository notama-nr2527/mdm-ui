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

import { FormControl, FormGroup, Validators } from "@angular/forms";
import { OpenIdConnectProviderDetail } from "@maurodatamapper/mdm-resources";
import { MdmValidators } from "@mdm/utility/mdm-validators";

export class OpenIdConnectProviderForm {
  group: FormGroup;

  constructor(provider?: OpenIdConnectProviderDetail) {
    this.group = new FormGroup({
      label: new FormControl(provider?.label, Validators.required),
      imageUrl: new FormControl(provider?.imageUrl),
      security: new FormGroup({
        clientId: new FormControl(provider?.clientId, Validators.required),
        clientSecret: new FormControl(provider?.clientSecret, Validators.required)
      }),
      discovery: new FormGroup({
        standardProvider: new FormControl(provider?.standardProvider),
        discoveryDocumentUrl: new FormControl(provider?.discoveryDocumentUrl, MdmValidators.requiredConditional(() => this.useStandardProvider)),
        issuer: new FormControl(provider?.discoveryDocument?.issuer, MdmValidators.requiredConditional(() => !this.useStandardProvider)),
        authorizationEndpoint: new FormControl(provider?.discoveryDocument?.authorizationEndpoint, MdmValidators.requiredConditional(() => !this.useStandardProvider)),
        tokenEndpoint: new FormControl(provider?.discoveryDocument?.tokenEndpoint, MdmValidators.requiredConditional(() => !this.useStandardProvider)),
        userinfoEndpoint: new FormControl(provider?.discoveryDocument?.userinfoEndpoint),
        endSessionEndpoint: new FormControl(provider?.discoveryDocument?.endSessionEndpoint),
        jwksUri: new FormControl(provider?.discoveryDocument?.jwksUri, MdmValidators.requiredConditional(() => !this.useStandardProvider)),
      }),
      authorizationEndpointParams: new FormGroup({
        scope: new FormControl(provider?.authorizationEndpointParameters?.scope),
        responseType: new FormControl(provider?.authorizationEndpointParameters?.responseType),
        responseMode: new FormControl(provider?.authorizationEndpointParameters?.responseMode),
        display: new FormControl(provider?.authorizationEndpointParameters?.display),
        prompt: new FormControl(provider?.authorizationEndpointParameters?.prompt),
        maxAge: new FormControl(provider?.authorizationEndpointParameters?.maxAge),
        uiLocales: new FormControl(provider?.authorizationEndpointParameters?.uiLocales),
        idTokenHint: new FormControl(provider?.authorizationEndpointParameters?.idTokenHint),
        loginHint: new FormControl(provider?.authorizationEndpointParameters?.loginHint),
        acrValues: new FormControl(provider?.authorizationEndpointParameters?.acrValues)
      })
    });
  }

  get label() {
    return this.group.get('label');
  }

  get imageUrl() {
    return this.group.get('imageUrl');
  }

  get clientId() {
    return this.group.get('security.clientId');
  }

  get clientSecret() {
    return this.group.get('security.clientSecret');
  }

  get standardProvider() {
    return this.group?.get('discovery.standardProvider');
  }

  get useStandardProvider(): boolean {
    return this.standardProvider?.value;
  }

  get discoveryDocumentUrl() {
    return this.group.get('discovery.discoveryDocumentUrl');
  }

  get issuer() {
    return this.group.get('discovery.issuer');
  }

  get authorizationEndpoint() {
    return this.group.get('discovery.authorizationEndpoint');
  }

  get tokenEndpoint() {
    return this.group.get('discovery.tokenEndpoint');
  }

  get userinfoEndpoint() {
    return this.group.get('discovery.userinfoEndpoint');
  }

  get endSessionEndpoint() {
    return this.group.get('discovery.endSessionEndpoint');
  }

  get jwksUri() {
    return this.group.get('discovery.jwksUri');
  }
}