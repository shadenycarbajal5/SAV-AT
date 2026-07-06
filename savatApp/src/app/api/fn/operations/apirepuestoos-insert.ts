/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

export interface Apirepuestoosinsert$Params {
    body: {
        idOs: number;
        idProducto: number;
        cantidad: number;
    };
}

export function apirepuestoosinsert(http: HttpClient, rootUrl: string, params: Apirepuestoosinsert$Params, context?: HttpContext): Observable<StrictHttpResponse<any>> {
    const rb = new RequestBuilder(rootUrl, apirepuestoosinsert.PATH, 'post');
    if (params) {
        rb.body(params.body, 'application/json');
    }
    return http.request(
        rb.build({ responseType: 'json', accept: 'application/json', context })
    ).pipe(
        filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
        map((r: HttpResponse<any>) => r as StrictHttpResponse<any>)
    );
}

apirepuestoosinsert.PATH = '/repuestoos/insert';
