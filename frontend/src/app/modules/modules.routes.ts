import { Routes } from '@angular/router';


export const routes: Routes = [
    {
        path: '',
        loadComponent: () => import('./dashboard/dashboard.component').then(c => c.FADashboardComponent),
        children: [
            {
                path: '',
                redirectTo: 'home',
                pathMatch: 'full'
            },
            {
                path: '404',
                loadComponent: () => import('./404/404.component').then(c => c.FA404Component)
            },
            {
                path: 'tasks',
                loadComponent: () => import('./tasks/tasks.component').then(c => c.FATasksComponent)
            },
            {
                path: '**',
                redirectTo: '404',
                pathMatch: 'full'
            }
        ]
    }
];
