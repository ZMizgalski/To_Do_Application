import { createSelector } from '@ngrx/store';

import { TasksState } from './tasks.reducer';

import { AppState } from '@models/store.types';


export const selectTasksState = (state: AppState) => state.tasks;

export const selectTasks = createSelector(
    selectTasksState,
    (state: TasksState) => state.tasks
);
