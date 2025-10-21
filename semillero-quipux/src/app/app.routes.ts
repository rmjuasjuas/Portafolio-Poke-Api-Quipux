import { Routes } from '@angular/router';
import { LandingPage } from './components/landing-page/landing-page';
import { AboutMe } from './components/about-me/about-me';
import { NotFound } from './components/not-found/not-found';
import { PokemonTable } from './components/pokemon-table/pokemon-table';
import { Skills } from './components/skills/skills';
import { Projects } from './components/projects/projects';
import { Contact } from './components/contact/contact';
import { PokemonLibrary } from './components/pokemon-library/pokemon-library';

export const routes: Routes = [
    {
        path: '',
        component: LandingPage
    },
    {
        path: 'about-me',
        component: AboutMe
    },
    {
        path: 'skills',
        component: Skills
    },
    {
        path: 'projects',
        component: Projects
    },
    {
        path: 'contact',
        component: Contact
    },
    {
        path: 'pokemon-table',
        component: PokemonTable
    },
    {
        path: 'pokemon-library',
        component: PokemonLibrary
    },
    {
        path: '**',
        component: NotFound
    }
];