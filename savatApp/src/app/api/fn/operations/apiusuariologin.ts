/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

export interface Apiusuariologin$Params {
    body: {
        username: string;
        password: string;
    };
}

export function apiusuariologin(http: HttpClient, rootUrl: string, params: Apiusuariologin$Params, context?: HttpContext): Observable<StrictHttpResponse<any>> {
    const rb = new RequestBuilder(rootUrl, apiusuariologin.PATH, 'post');

    if (params?.body) {
        rb.body(params.body, 'application/json');
    }

    return http.request(
        rb.build({ responseType: 'json', accept: 'application/json', context })
    ).pipe(
        filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
        map((r: HttpResponse<any>) => {
            return r as StrictHttpResponse<any>;
        })
    );
}

apiusuariologin.PATH = '/usuario/login';
