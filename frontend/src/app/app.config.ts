import { ApplicationConfig, CSP_NONCE, inject, provideZoneChangeDetection } from '@angular/core';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideHttpClient, withXsrfConfiguration } from '@angular/common/http';
import { Meta } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { provideEffects } from '@ngrx/effects';
import { provideState, provideStore } from '@ngrx/store';

import { routes } from './app.routes';

import { FATasksEffects } from '@core/ngrx/tasks.effects';
import { tasksReducer } from '@core/ngrx/tasks.reducer';

import Aura from '@primeng/themes/aura';

import { providePrimeNG } from 'primeng/config';
import { MessageService } from 'primeng/api';


export const appConfig: ApplicationConfig = {
    providers: [
        MessageService,
        provideZoneChangeDetection({ eventCoalescing: true }),
        provideRouter(routes),
        provideHttpClient(
            withXsrfConfiguration({
                cookieName: 'csrf_token',
                headerName: 'X-CSRF-Token'
            })
        ),
        provideAnimationsAsync(),
        provideStore(),
        provideState({ name: 'tasks', reducer: tasksReducer }),
        providePrimeNG({
            theme: {
                preset: Aura,
                options: {
                    darkModeSelector: false
                }
            }
        }),
        provideEffects([ FATasksEffects ]),
        {
            provide: CSP_NONCE,
            useFactory: () => inject(Meta).getTag('name="nonce"')?.content ?? null
        }
    ]
};
