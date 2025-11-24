import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors, withFetch } from '@angular/common/http';

import { routes } from './app.routes';
import { authInterceptor } from './services/auth.interceptor'; // 👈 Vérifie ce chemin !

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),

    // C'EST ICI QUE TOUT SE JOUE :
    provideHttpClient(
      withFetch(),
      withInterceptors([authInterceptor]) // 👈 Il doit être ici
    )
  ]
};
