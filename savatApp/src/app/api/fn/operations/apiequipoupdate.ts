/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

export interface Apiequipoupdate$Params {
    id: number;
    body: {
        marca?: string | null;
        modelo?: string | null;
        numeroSerie?: string | null;
    };
}

export function apiequipoupdate(http: HttpClient, rootUrl: string, params: Apiequipoupdate$Params, context?: HttpContext): Observable<StrictHttpResponse<any>> {
    const rb = new RequestBuilder(rootUrl, apiequipoupdate.PATH, 'put');
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

apiequipoupdate.PATH = '/equipo/update/{id}';