import { FormBuilder, FormGroupDirective, ReactiveFormsModule, Validators } from '@angular/forms';
import { afterNextRender, ChangeDetectionStrategy, Component, inject, viewChild, ViewEncapsulation } from '@angular/core';

import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DatePickerModule } from 'primeng/datepicker';


@Component({
    imports: [ ButtonModule, InputTextModule, ReactiveFormsModule, DatePickerModule ],
    templateUrl: './modify-task-modal.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class FAModifyTaskModalComponent {
    public readonly ref = inject(DynamicDialogRef);
    public readonly config = inject(DynamicDialogConfig);
    public readonly formBuilder = inject(FormBuilder);

    public readonly minDate = new Date();

    public readonly taskForm = this.formBuilder.group(
        {
            title: [ null, [ Validators.required ] ],
            due_date: [ null, [ Validators.required ] ]
        }
    );

    private readonly _ngForm = viewChild.required<FormGroupDirective>('ngForm');

    constructor() {
        afterNextRender(() => {
            const existingTask = this.config.data;

            if (existingTask) {
                const payload = {
                    title: existingTask.title,
                    due_date: new Date(existingTask.due_date)
                };

                this._ngForm().resetForm(payload);
            }
        });
    }

    public save(): void {
        const data = this.taskForm.value;
        const dateFormat = new Intl.DateTimeFormat(
            'en-CA',
            {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            }
        );

        const dueDate = data.due_date;

        if (!dueDate) {
            return;
        }

        this.ref.close({
            ...data,
            due_date: dateFormat.format(dueDate).replace(/\//g, '-')
        });
    }
}
