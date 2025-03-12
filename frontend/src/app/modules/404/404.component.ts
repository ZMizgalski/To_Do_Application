import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';


@Component({
    templateUrl: './404.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: {
        class: 'flex flex-auto'
    }
})
export class FA404Component {}
