/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

export interface Apiproveedorgetall$Params {}

export function apiproveedorgetall(http: HttpClient, rootUrl: string, params?: Apiproveedorgetall$Params, context?: HttpContext): Observable<StrictHttpResponse<any>> {
    const rb = new RequestBuilder(rootUrl, apiproveedorgetall.PATH, 'get');
    return http.request(
        rb.build({ responseType: 'json', accept: 'application/json', context })
    ).pipe(
        filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
        map((r: HttpResponse<any>) => r as StrictHttpResponse<any>)
    );
}

apiproveedorgetall.PATH = '/proveedor/getall';
