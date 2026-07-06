/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

export interface Apirepuestoos_getbyos$Params {
    idOs: number;
}

export function apirepuestoos_getbyos(http: HttpClient, rootUrl: string, params: Apirepuestoos_getbyos$Params, context?: HttpContext): Observable<StrictHttpResponse<any>> {
    const rb = new RequestBuilder(rootUrl, apirepuestoos_getbyos.PATH, 'get');
    if (params) {
        rb.path('idOs', params.idOs);
    }
    return http.request(
        rb.build({ responseType: 'json', accept: 'application/json', context })
    ).pipe(
        filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
        map((r: HttpResponse<any>) => r as StrictHttpResponse<any>)
    );
}

apirepuestoos_getbyos.PATH = '/repuestoos/getbyordenservicio/{idOs}';
