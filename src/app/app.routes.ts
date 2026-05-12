import { Routes } from '@angular/router';
import { Home } from './home/home';

export const routes: Routes = [
    {path: "home", component:Home},

    // Ruta vacia
    {path: '', redirectTo: '/home', pathMatch: 'full'},

    // Ruta incorrecta
    {path: '**', redirectTo: '/home', pathMatch: 'full'},
];
