import { createAction, props } from '@ngrx/store';

import { TaskAction, TaskDTOModel, TaskModel, TaskNotificationEvent } from '@models/tasks.types';


export const loadTasksAction = createAction(
    TaskAction.LOAD
);

export const loadSuccessAction = createAction(
    TaskAction.LOAD_SUCCESS,
    props<{ tasks: TaskModel[] }>()
);

export const loadNotificationAction = createAction(
    TaskAction.LOAD_NOTIFICATION
);

export const loadNotificationAddSuccessAction = createAction(
    TaskAction.LOAD_NOTIFICATION_ADD,
    props<{ notification: TaskNotificationEvent<TaskModel> }>()
);

export const loadNotificationUpdateSuccessAction = createAction(
    TaskAction.LOAD_NOTIFICATION_UPDATE,
    props<{ notification: TaskNotificationEvent<TaskModel> }>()
);

export const loadNotificationDeleteSuccessAction = createAction(
    TaskAction.LOAD_NOTIFICATION_DELETE,
    props<{ notification: TaskNotificationEvent<{ id: number }> }>()
);

export const addTaskAction = createAction(
    TaskAction.ADD_TASK,
    props<{ task: TaskDTOModel }>()
);

export const addTaskActionSuccess = createAction(
    TaskAction.ADD_TASK_SUCCESS
);

export const updateTaskAction = createAction(
    TaskAction.UPDATE_TASK,
    props<{ taskID: number, task: TaskDTOModel }>()
);

export const updateTaskActionSuccess = createAction(
    TaskAction.UPDATE_TASK_SUCCESS
);

export const deleteTaskAction = createAction(
    TaskAction.DELETE_TASK,
    props<{ taskID: number }>()
);

export const deleteTaskActionSuccess = createAction(
    TaskAction.DELETE_TASK_SUCCESS
);
