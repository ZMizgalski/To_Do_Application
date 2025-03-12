import { MenuItem } from 'primeng/api';


export type TaskDTOModel = {
    title: string;
    completed: boolean;
    due_date: Date;
};

export type TaskModel =
    & TaskDTOModel
    & {
        id: number;
    };

export type TaskDialogModel = Omit<TaskDTOModel, 'completed'>;

export type TaskNotificationEvent<T> = {
    data: T;
    notification: string;
};

export type TaskListModel = {
    data: TaskModel;
    actions: MenuItem[];
}

export enum TaskAction {
    LOAD = '[Task] Load',
    LOAD_SUCCESS = '[Task] Load Success',
    LOAD_NOTIFICATION = '[Task] Load Notification',
    LOAD_NOTIFICATION_ADD = '[Task] Load Notification Add Success',
    LOAD_NOTIFICATION_UPDATE = '[Task] Load Notification Update Success',
    LOAD_NOTIFICATION_DELETE = '[Task] Load Notification Delete Success',
    ADD_TASK = '[Task] Add Task',
    ADD_TASK_SUCCESS = '[Task] Add Task Success',
    UPDATE_TASK = '[Task] Update Task',
    UPDATE_TASK_SUCCESS = '[Task] Update Task Success',
    DELETE_TASK = '[Task] Delete Task',
    DELETE_TASK_SUCCESS = '[Task] Delete Task Success',
}
