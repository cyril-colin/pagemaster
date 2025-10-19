import { Routes } from '@angular/router';
import { PageMasterRoutes } from './core/pagemaster.router';



export const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },

  ...Object.values(PageMasterRoutes()),
];