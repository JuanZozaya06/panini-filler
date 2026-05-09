import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { getAnalytics, provideAnalytics } from '@angular/fire/analytics';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { environment } from '../environments/environment';

const firebaseProviders = environment.firebase.enabled
  ? [
      provideFirebaseApp(() => initializeApp(environment.firebase.config)),
      provideAnalytics(() => getAnalytics()),
      provideFirestore(() => getFirestore())
    ]
  : [];

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    ...firebaseProviders
  ]
};
