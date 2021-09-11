import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

// Trigger the login when creating the session
@Injectable()
export class LogInWithCredentialsGuard extends AuthGuard('local') {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    // check the email and the password
    const result = (await super.canActivate(context)) as boolean;

    // initialize the session
    const request = context.switchToHttp().getRequest();
    const { user } = request;
    const adminLogin = request.path === '/api/admin/log-in';
    if (user.is_ambassador && adminLogin) {
      throw new UnauthorizedException();
    }

    // call the passport login and pass from context
    await super.logIn(request);

    // if no exceptions were thrown, allow the access to the route
    return result;
  }
}
