/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

export interface Apiproveedorupdate$Params {
    id: number;
    body: {
        nombre: string;
        ruc?: string | null;
        telefono?: string | null;
        correo?: string | null;
        direccion?: string | null;
    };
}

export function apiproveedorupdate(http: HttpClient, rootUrl: string, params: Apiproveedorupdate$Params, context?: HttpContext): Observable<StrictHttpResponse<any>> {
    const rb = new RequestBuilder(rootUrl, apiproveedorupdate.PATH, 'put');
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

apiproveedorupdate.PATH = '/proveedor/update/{id}';