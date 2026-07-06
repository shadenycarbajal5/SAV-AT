/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

export interface Apiclienteinsert$Params {
    body: {
        nombres: string;
        dniRuc?: string | null;
        telefono?: string | null;
        correo?: string | null;
        direccion?: string | null;
        idCategoriaCliente?: number | null;
    };
}

export function apiclienteinsert(http: HttpClient, rootUrl: string, params: Apiclienteinsert$Params, context?: HttpContext): Observable<StrictHttpResponse<any>> {
    const rb = new RequestBuilder(rootUrl, apiclienteinsert.PATH, 'post');
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

apiclienteinsert.PATH = '/cliente/insert';
