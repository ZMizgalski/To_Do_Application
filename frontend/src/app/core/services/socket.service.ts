import { inject, Injectable, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';

import { loadNotificationAction, loadTasksAction } from '@core/ngrx/tasks.actions';

import { AppState } from '@models/store.types';
import { TaskModel, TaskNotificationEvent } from '@models/tasks.types';

import { io } from 'socket.io-client';

import { environment } from 'environments/environment';


@Injectable({
    providedIn: 'root'
})
export class FASocketService implements OnDestroy {
    public readonly store = inject<Store<AppState>>(Store);

    public readonly tasks$ = this.onEvent<TaskModel[]>('tasks');
    public readonly $add = this.onEvent<TaskNotificationEvent<TaskModel>>('add');
    public readonly $delete = this.onEvent<TaskNotificationEvent<{ id: number }>>('delete');
    public readonly $update = this.onEvent<TaskNotificationEvent<TaskModel>>('update');

    private readonly _socket = io(
        environment.url,
        {
            reconnection: true,
            reconnectionDelay: 300,
            transports: [ 'websocket', 'polling' ]
        }
    );

    constructor() {
        this._socket.on(
            'connect',
            () =>{
                this.store.dispatch(loadTasksAction());
                this.store.dispatch(loadNotificationAction());
            }
        );
    }

    public ngOnDestroy(): void {
        this._socket.off('connect');
        this._socket.disconnect();
    }

    public onEvent<T>(eventName: string) {
        return new Observable<T>(observer => {
            const handler = (data: T) => observer.next(data);

            this._socket.on(eventName, handler);

            return () => {
                this._socket.off(eventName);
            };
        });
    };
}
