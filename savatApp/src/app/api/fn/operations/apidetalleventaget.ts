/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

export interface Apidetalleventaget$Params {
    idVenta: number;
}

export function apidetalleventaget(http: HttpClient, rootUrl: string, params: Apidetalleventaget$Params, context?: HttpContext): Observable<StrictHttpResponse<any>> {
    const rb = new RequestBuilder(rootUrl, apidetalleventaget.PATH, 'get');
    if (params) {
        rb.path('idVenta', params.idVenta);
    }
    return http.request(
        rb.build({ responseType: 'json', accept: 'application/json', context })
    ).pipe(
        filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
        map((r: HttpResponse<any>) => r as StrictHttpResponse<any>)
    );
}

apidetalleventaget.PATH = '/venta/detalle/{idVenta}';
