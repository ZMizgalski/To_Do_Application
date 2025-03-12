import { HttpContext, HttpHeaders, HttpParams } from '@angular/common/http';

import { XOR } from 'ts-xor';


export type HttpPullMethod = 'DELETE' | 'JSONP' | 'OPTIONS' | 'GET' | 'HEAD';

export type HttpPushMethod = 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export type HttpResponseType = 'arraybuffer' | 'blob' | 'json' | 'text';

export type HttpExtras = Partial<XOR<HttpExtrasBase, HttpExtrasCache>>;

export type HttpExtrasBase = {
    headers: HttpHeaders;
    context: HttpContext;
    reportProgress: boolean;
    params: HttpParams;
    responseType: HttpResponseType;
    withCredentials: boolean;
};

export type HttpTransferCache = Partial<{
    includeHeaders: string[];
}>;

export type HttpExtrasCache =
    & HttpExtrasBase
    & {
        transferCache: HttpTransferCache | boolean;
    };
