import { HttpClient, HttpErrorResponse, HttpRequest, HttpResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, filter, of, retry, switchMap, throwError, timer } from 'rxjs';

import { environment } from '../../../environments/environment';

import { HttpExtras, HttpPullMethod, HttpPushMethod } from '@models/http-service.types';

import { isEmpty } from 'lodash-es';


@Injectable({
    providedIn: 'root'
})
export class FAHttpService {
    private readonly _http = inject(HttpClient);

    public get<K>(path: string, extras?: HttpExtras): Observable<K> {
        return this._createPullRequest<null, K>('GET', path, extras);
    }

    public delete<T, K>(path: string, body?: T, extras?: HttpExtras): Observable<K>;
    public delete<T, K>(path: string, body: T, extras?: HttpExtras): Observable<K> {
        return body
            ? this._createPushRequest<T, K>('DELETE', path, body, extras)
            : this._createPullRequest<null, K>('DELETE', path, extras);
    }

    public jsonp<K>(path: string, extras?: HttpExtras): Observable<K> {
        return this._createPullRequest<null, K>('JSONP', path, extras);
    }

    public options<K>(path: string, extras?: HttpExtras): Observable<K> {
        return this._createPullRequest<null, K>('OPTIONS', path, extras);
    }

    public head<K>(path: string, extras?: HttpExtras): Observable<K> {
        return this._createPullRequest<null, K>('HEAD', path, extras);
    }

    public post<T, K>(path: string, body: T, extras?: HttpExtras): Observable<K> {
        return this._createPushRequest<T, K>('POST', path, body, extras);
    }

    public put<T, K>(path: string, body: T, extras?: HttpExtras): Observable<K> {
        return this._createPushRequest<T, K>('PUT', path, body, extras);
    }

    public patch<T, K>(path: string, body: T, extras?: HttpExtras): Observable<K> {
        return this._createPushRequest<T, K>('PATCH', path, body, extras);
    }

    private _createPullRequest<T, K>(method: HttpPullMethod, path: string, extras?: HttpExtras): Observable<K> {
        const req = new HttpRequest(method, `${environment.url}/${path}`, this._createHttpExtras(extras));

        return this._requestHandler<T, K>(req as HttpRequest<T>);
    }

    private _createPushRequest<T, K>(method: HttpPushMethod, path: string, body: T, extras?: HttpExtras): Observable<K> {
        const req = new HttpRequest<T>(method, `${environment.url}/${path}`, body, this._createHttpExtras(extras));

        return this._requestHandler<T, K>(req);
    }

    private _requestHandler<T, K>(req: HttpRequest<T>): Observable<K> {
        return this._http.request<K>(req).pipe(
            retry({
                count: 1,
                delay: (_, retryCount) => timer(retryCount * 1000)
            }),
            filter((event): event is HttpResponse<K> => event instanceof HttpResponse),
            switchMap(response => this._validateRequest(response)),
            catchError(this._handleError.bind(this))
        );
    }

    private _createHttpExtras(extras?: HttpExtras): HttpExtras {
        return {
            ...extras,
            withCredentials: !environment.production
        };
    }

    private _validateRequest<K>(response: HttpResponse<K>): Observable<K> {
        const { body } = response;

        return isEmpty(body) ? this._throwError('Response body is empty!') : of(body as K);
    }

    private _handleError(errorResponse: HttpErrorResponse): Observable<never> {
        const { message } = errorResponse;

        return this._throwError(message);
    }

    private _throwError(message: string): Observable<never> {
        return throwError(() => new Error(message));
    }
}
