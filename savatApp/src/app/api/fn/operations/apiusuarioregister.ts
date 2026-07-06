/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

export interface Apiusuarioregister$Params {
    body: {
        nombres: string;
        username: string;
        password: string;
        rol: string;
    };
}

export function apiusuarioregister(http: HttpClient, rootUrl: string, params: Apiusuarioregister$Params, context?: HttpContext): Observable<StrictHttpResponse<any>> {
    const rb = new RequestBuilder(rootUrl, apiusuarioregister.PATH, 'post');
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

apiusuarioregister.PATH = '/usuario/register';
