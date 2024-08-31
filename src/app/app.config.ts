import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';

export const appConfig: ApplicationConfig = {
  providers: [provideRouter(routes), provideFirebaseApp(() => initializeApp({"projectId":"da-notes-1e30d","appId":"1:359065256776:web:2aa9c8956c31c487fea97d","storageBucket":"da-notes-1e30d.appspot.com","apiKey":"AIzaSyCJaMhJruSZZ9JOJg60LknNs4ELjeyksMw","authDomain":"da-notes-1e30d.firebaseapp.com","messagingSenderId":"359065256776"})), provideFirestore(() => getFirestore())]
};
