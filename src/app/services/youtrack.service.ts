import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {SharedService} from './shared.service';
import { Observable } from 'rxjs';
import {SecurityHandlerService} from './handlers/security-handler.service';
import { mergeMap } from 'rxjs/operators';

@Injectable({
    providedIn: 'root'
})
export class YoutrackService {

    username: string;

    constructor(
        private httpClient: HttpClient,
        private sharedService: SharedService,
        private securityHandlerService: SecurityHandlerService
    ) {
        this.username = securityHandlerService.getUserFromLocalStorage()?.firstName + ' ' +
            securityHandlerService.getUserFromLocalStorage()?.lastName;
    }

    reportIssueToYouTrack(summary: string,
                          description: string): Observable<object> {
        // make sure youTrack is configured


        return this.getYoutrackProjectId(this.sharedService.youTrack.project).pipe(
          mergeMap((data: object) => this.submitIssueToYouTrack(data[0].id, summary, description))
        );
    }

    getYoutrackProjectId(shortName: string): Observable<object> {
        const url: string = this.sharedService.youTrack.url + '/api/admin/projects?fields=id,name,shortName&query=' + encodeURIComponent(shortName);

        return this.httpClient.get(url);
    }


    submitIssueToYouTrack(projectId: string,
                          summary: string,
                          description: string): Observable<object> {

        const url = this.sharedService.youTrack.url + '/api/issues';

        this.username = this.securityHandlerService.getUserFromLocalStorage()?.firstName + ' ' +
            this.securityHandlerService.getUserFromLocalStorage()?.lastName;


        const body = {
            summary,
            description,
            project: {
                id: projectId
            },
            customFields: [ {
                value: this.username,
                name: 'Reporter\'s name',
                $type: 'SimpleIssueCustomField'
            } ]
        };

        return this.httpClient.post(url, body);

    }


}
