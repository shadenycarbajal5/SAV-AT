/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

export interface DetalleItemVenta {
    idProducto: number;
    cantidad: number;
}

export interface Apiventainsert$Params {
    body: {
        descuento?: number | null;
        metodoPago?: string | null;  // EFECTIVO | TARJETA | TRANSFERENCIA | YAPE | PLIN
        idCliente?: number | null;
        idUsuario: number;
        detalle: DetalleItemVenta[];
    };
}

export function apiventainsert(http: HttpClient, rootUrl: string, params: Apiventainsert$Params, context?: HttpContext): Observable<StrictHttpResponse<any>> {
    const rb = new RequestBuilder(rootUrl, apiventainsert.PATH, 'post');
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

apiventainsert.PATH = '/venta/insert';