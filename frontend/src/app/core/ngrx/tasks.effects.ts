import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, debounceTime, EMPTY, exhaustMap, map, merge, switchMap, tap } from 'rxjs';

import {
    loadTasksAction, loadSuccessAction, loadNotificationAction, addTaskAction,
    addTaskActionSuccess, updateTaskAction, updateTaskActionSuccess, deleteTaskAction,
    deleteTaskActionSuccess, loadNotificationAddSuccessAction, loadNotificationDeleteSuccessAction,
    loadNotificationUpdateSuccessAction
} from './tasks.actions';

import { FASocketService } from '@core/services/socket.service';
import { FAHttpService } from '@core/services/http-service.service';

import { MessageService } from 'primeng/api';


@Injectable()
export class FATasksEffects {
    public readonly actions$ = inject(Actions);
    public readonly socketService = inject(FASocketService);
    public readonly httpService = inject(FAHttpService);
    public readonly messageService = inject(MessageService);

    public readonly addTask$ = createEffect(
        () => this.actions$.pipe(
            ofType(addTaskAction),
            switchMap(({ task }) => this.httpService.post('api/tasks', task).pipe(
                map(() => addTaskActionSuccess()),
                catchError(() => EMPTY)
            ))
        )
    );

    public readonly updateTask$ = createEffect(
        () => this.actions$.pipe(
            ofType(updateTaskAction),
            switchMap(({ taskID, task }) => this.httpService.put(`api/tasks/${taskID}`, task).pipe(
                map(() => updateTaskActionSuccess()),
                catchError(() => EMPTY)
            ))
        )
    );

    public readonly deleteTask$ = createEffect(
        () => this.actions$.pipe(
            ofType(deleteTaskAction),
            switchMap(({ taskID }) => this.httpService.delete(`api/tasks/${taskID}`).pipe(
                map(() => deleteTaskActionSuccess()),
                catchError(() => EMPTY)
            ))
        )
    );

    public readonly loadTasks$ = createEffect(
        () => this.actions$.pipe(
            ofType(loadTasksAction),
            exhaustMap(
                () => this.socketService.tasks$.pipe(
                    map(tasks => loadSuccessAction({ tasks })),
                    catchError(() => EMPTY)
                )
            )
        )
    );

    public readonly sendNotification$ = createEffect(
        () => this.actions$.pipe(
            ofType(loadNotificationAction),
            switchMap(
                () => merge(
                    this.socketService.$add.pipe(
                        tap(({ notification }) => this._showToast('Task Added', notification)),
                        map(notification => loadNotificationAddSuccessAction({ notification }))
                    ),
                    this.socketService.$delete.pipe(
                        tap(({ notification }) => this._showToast('Task Deleted', notification)),
                        map(notification => loadNotificationDeleteSuccessAction({ notification }))
                    ),
                    this.socketService.$update.pipe(
                        tap(({ notification }) => this._showToast('Task Updated', notification)),
                        map(notification => loadNotificationUpdateSuccessAction({ notification }))
                    )
                ).pipe(
                    debounceTime(0),
                    catchError(() => EMPTY)
                )
            )
        )
    );

    private _showToast(summary: string, detail: string): void {
        this.messageService.add({ closable: true, summary, detail, severity: 'info' });
    }
}
