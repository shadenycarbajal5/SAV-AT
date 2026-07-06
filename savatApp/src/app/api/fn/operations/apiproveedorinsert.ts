/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

export interface Apiproveedorinsert$Params {
    body: {
        nombre: string;
        ruc?: string | null;
        telefono?: string | null;
        correo?: string | null;
        direccion?: string | null;
    };
}

export function apiproveedorinsert(http: HttpClient, rootUrl: string, params: Apiproveedorinsert$Params, context?: HttpContext): Observable<StrictHttpResponse<any>> {
    const rb = new RequestBuilder(rootUrl, apiproveedorinsert.PATH, 'post');
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

apiproveedorinsert.PATH = '/proveedor/insert';