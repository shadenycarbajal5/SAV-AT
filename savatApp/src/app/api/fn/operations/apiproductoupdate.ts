/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

export interface Apiproductoupdate$Params {
    id: number;
    body: {
        nombre: string;
        descripcion?: string | null;
        precioVenta?: number | null;
        costo?: number | null;
        stock?: number | null;
        stockMinimo?: number | null;
        codigoBarras?: string | null;
        tipoProducto?: 'VENTA' | 'REPUESTO' | null;
        estado?: boolean | null;
        idCategoriaProducto?: number | null;
        idProveedor?: number | null;
    };
}

export function apiproductoupdate(http: HttpClient, rootUrl: string, params: Apiproductoupdate$Params, context?: HttpContext): Observable<StrictHttpResponse<any>> {
    const rb = new RequestBuilder(rootUrl, apiproductoupdate.PATH, 'put');
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

apiproductoupdate.PATH = '/producto/update/{id}';
