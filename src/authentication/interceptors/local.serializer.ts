import { PassportSerializer } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { User } from 'src/users/entities/user.entity';
interface DeserializedRequest {
  id: string;
  scope: string;
}

@Injectable()
export class LocalSerializer extends PassportSerializer {
  constructor(private readonly usersService: UsersService) {
    super();
  }

  serializeUser(user: User, done: CallableFunction) {
    // save userID to session but could add anything

    const scope = user.is_ambassador ? 'ambassador' : 'admin';
    done(null, { id: user.id, scope });
  }

  async deserializeUser(
    userresponse: DeserializedRequest,
    done: CallableFunction,
  ) {
    const { id, scope } = userresponse;
    const user = await this.usersService.findOne(id);
    const { password, ...data } = user;
    // get user from db when session userId is passed
    done(null, { ...data, scope });
  }
}
