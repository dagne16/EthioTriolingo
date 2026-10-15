import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

/**
 * Used on the landing ('' ), '/login', and '/signup' routes.
 * Waits for the initial session-restore check, then:
 *  - already logged in  -> redirect to /learn (skip the auth screen)
 *  - not logged in      -> let the route render as normal
 */
export const redirectIfLoggedInGuard: CanActivateFn = async () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  await auth.readyPromise;
  return auth.isLoggedIn() ? router.parseUrl('/learn') : true;
};

/**
 * Used on routes that only make sense for a signed-in user (e.g. /choose-mascot).
 * Waits for session restore, then sends guests back to the landing page.
 */
export const requireAuthGuard: CanActivateFn = async () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  await auth.readyPromise;
  return auth.isLoggedIn() ? true : router.parseUrl('/');
};
