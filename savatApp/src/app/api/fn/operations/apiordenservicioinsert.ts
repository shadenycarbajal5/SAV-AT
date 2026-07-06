/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

export interface Apiordenservicioinsert$Params {
    body: {
        fechaEntrega?: string | null;       // LocalDate → 'YYYY-MM-DD'
        descripcionProblema?: string | null;
        estado?: string | null;             // RECIBIDO | DIAGNOSTICO | REPARACION | LISTO | ENTREGADO | CANCELADO
        idCliente: number;
        idUsuario: number;
        idEquipo: number;
    };
}

export function apiordenservicioinsert(http: HttpClient, rootUrl: string, params: Apiordenservicioinsert$Params, context?: HttpContext): Observable<StrictHttpResponse<any>> {
    const rb = new RequestBuilder(rootUrl, apiordenservicioinsert.PATH, 'post');
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

apiordenservicioinsert.PATH = '/ordenservicio/insert';