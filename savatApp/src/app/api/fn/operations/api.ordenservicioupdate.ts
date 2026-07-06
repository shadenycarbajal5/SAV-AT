/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

export interface Apiordenservicioupdate$Params {
    id: number;
    body: {
        fechaEntrega?: string | null;
        descripcionProblema?: string | null;
        estado?: string | null;
        idCliente: number;
        idUsuario: number;
        idEquipo: number;
    };
}

export function apiordenservicioupdate(http: HttpClient, rootUrl: string, params: Apiordenservicioupdate$Params, context?: HttpContext): Observable<StrictHttpResponse<any>> {
    const rb = new RequestBuilder(rootUrl, apiordenservicioupdate.PATH, 'put');
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

apiordenservicioupdate.PATH = '/ordenservicio/update/{id}';