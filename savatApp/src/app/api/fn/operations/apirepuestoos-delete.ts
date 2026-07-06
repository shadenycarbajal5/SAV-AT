/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

export interface Apirepuestoos_delete$Params {
    id: number;
}

export function apirepuestoos_delete(http: HttpClient, rootUrl: string, params: Apirepuestoos_delete$Params, context?: HttpContext): Observable<StrictHttpResponse<any>> {
    const rb = new RequestBuilder(rootUrl, apirepuestoos_delete.PATH, 'delete');
    if (params) {
        rb.path('id', params.id);
    }
    return http.request(
        rb.build({ responseType: 'json', accept: 'application/json', context })
    ).pipe(
        filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
        map((r: HttpResponse<any>) => r as StrictHttpResponse<any>)
    );
}

apirepuestoos_delete.PATH = '/repuestoos/delete/{id}';
