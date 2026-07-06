/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

export interface Apicotizaciondelete$Params {
    id: number;
}

export function apicotizaciondelete(http: HttpClient, rootUrl: string, params: Apicotizaciondelete$Params, context?: HttpContext): Observable<StrictHttpResponse<any>> {
    const rb = new RequestBuilder(rootUrl, apicotizaciondelete.PATH, 'delete');
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

apicotizaciondelete.PATH = '/cotizacion/delete/{id}';
