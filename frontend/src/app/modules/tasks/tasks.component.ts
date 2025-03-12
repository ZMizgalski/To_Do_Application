import { AsyncPipe } from '@angular/common';
import { animate, query, stagger, style, transition, trigger } from '@angular/animations';
import { Component, ChangeDetectionStrategy, ViewEncapsulation, inject, DestroyRef } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filter, map, tap } from 'rxjs';

import { FAModifyTaskModalComponent } from './modify-task-modal/modify-task-modal.component';

import { selectTasks } from '@core/ngrx/tasks.selectors';
import { addTaskAction, deleteTaskAction, updateTaskAction } from '@core/ngrx/tasks.actions';

import { isNonNullish } from '@utils/is-non-nullish.utils';

import { TaskDialogModel, TaskDTOModel, TaskListModel, TaskModel } from '@models/tasks.types';

import { CheckboxModule } from 'primeng/checkbox';
import { MenuModule } from 'primeng/menu';
import { PrimeIcons } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DialogService, DynamicDialogConfig } from 'primeng/dynamicdialog';


const TasksAnimation = trigger('tasksAnimation', [
    transition('* <=> *', [
        query(':enter',
            [
                style({ opacity: 0 }),
                stagger('50ms', animate('100ms ease-in', style({ opacity: 1 })))
            ],
            { optional: true }
        )
    ])
]);

@Component({
    templateUrl: './tasks.component.html',
    imports: [ AsyncPipe, FormsModule, ReactiveFormsModule, CheckboxModule, MenuModule, ButtonModule, InputTextModule ],
    animations: [ TasksAnimation ],
    providers: [ DialogService ],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class FATasksComponent {
    public readonly store = inject(Store);
    public readonly dialogService = inject(DialogService);

    public readonly tasks$ = this.store.select(selectTasks)
        .pipe(
            map(tasks => tasks.map(task => this._constructTask(task)))
        );

    private readonly _destroyRef = inject(DestroyRef);

    public openAddDialog = () => this._openTaskModifyDialog(
        payload => this.store.dispatch(addTaskAction({
            task: {
                ...payload,
                completed: false
            }
        }))
    );

    public editTask = (taskID: number, task: TaskDTOModel) => this.store.dispatch(updateTaskAction({ taskID, task }));

    private _openTaskModifyDialog(callback: (payload: TaskDialogModel) => void, data?: TaskDTOModel): void {
        const config: DynamicDialogConfig = {
            header: 'Task',
            modal: true,
            focusOnShow: false,
            data
        };

        const ref = this.dialogService.open(FAModifyTaskModalComponent, config);

        ref.onClose
            .pipe(
                filter(isNonNullish),
                tap(data => callback(data)),
                takeUntilDestroyed(this._destroyRef)
            )
            .subscribe();
    }

    private _constructTask(task: TaskModel): TaskListModel {
        const { id, ...rest } = task;

        const actions = [
            {
                icon: PrimeIcons.PENCIL,
                label: 'Edit',
                command: () => this._openTaskModifyDialog(
                    payload => this.editTask(
                        id,
                        {
                            ...payload,
                            completed: rest.completed
                        }
                    ),
                    rest
                )
            },
            {
                icon: PrimeIcons.TRASH,
                label: 'Delete',
                command: () => this.store.dispatch(deleteTaskAction({ taskID: id }))
            }
        ];

        return {
            data: task,
            actions
        };
    }
}
