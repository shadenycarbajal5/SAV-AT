/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

export interface Apicotizacionestado$Params {
    id: number;
    body: {
        estado: string;  // PENDIENTE | APROBADA | RECHAZADA | CONVERTIDA
    };
}

export function apicotizacionestado(http: HttpClient, rootUrl: string, params: Apicotizacionestado$Params, context?: HttpContext): Observable<StrictHttpResponse<any>> {
    const rb = new RequestBuilder(rootUrl, apicotizacionestado.PATH, 'patch');
    if (params) {
        rb.path('id', params.id);
        rb.body(params.body, 'application/json');
    }
    return http.request(
        rb.build({ responseType: 'json', accept: 'application/json', context })
    ).pipe(
        filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
        map((r: HttpResponse<any>) => r as StrictHttpResponse<any>)
    );
}

apicotizacionestado.PATH = '/cotizacion/estado/{id}';