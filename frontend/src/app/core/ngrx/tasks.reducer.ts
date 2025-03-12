import { createReducer, on } from '@ngrx/store';

import { loadNotificationAddSuccessAction, loadNotificationDeleteSuccessAction, loadNotificationUpdateSuccessAction, loadSuccessAction } from './tasks.actions';

import { TaskModel } from '@models/tasks.types';


export interface TasksState {
    tasks: TaskModel[];
}

export const initialState: TasksState = {
    tasks: []
};

export const tasksReducer = createReducer(
    initialState,
    on(
        loadSuccessAction,
        (state, { tasks }) => ({ ...state, tasks })
    ),
    on(
        loadNotificationAddSuccessAction,
        (state, { notification }) => ({
            ...state,
            tasks: [ ...state.tasks, notification.data ]
        })
    ),
    on(
        loadNotificationUpdateSuccessAction,
        (state, { notification }) => ({
            ...state,
            tasks: state.tasks.map(existingTask => existingTask.id === notification.data.id ? notification.data : existingTask)
        })
    ),
    on(
        loadNotificationDeleteSuccessAction,
        (state, { notification }) => ({
            ...state,
            tasks: state.tasks.filter(existingTask => existingTask.id !== notification.data.id)
        })
    )
);
