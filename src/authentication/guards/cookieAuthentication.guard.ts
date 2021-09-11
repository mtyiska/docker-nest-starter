import { ExecutionContext, Injectable, CanActivate } from '@nestjs/common';

// This is called on subsequent calls and checks the session store
// to see if the user exists
@Injectable()
export class CookieAuthenticationGuard implements CanActivate {
  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    try {
      const isAuthenticated = request.isAuthenticated();
      const scope = request.session.passport.user.scope;
      const ambassadorPath =
        request.path.toString().indexOf('/api/ambassador') >= 0;
      const auth =
        (isAuthenticated && ambassadorPath && scope === 'ambassador') ||
        (isAuthenticated && !ambassadorPath && scope === 'admin');
      return auth;
    } catch (err) {
      console.log(err);
    }
  }
}
