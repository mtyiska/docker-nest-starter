// import { NestFactory } from '@nestjs/core';
// import { AppModule } from '../app.module';
// import { UsersService } from '../users/users.service';

// import * as faker from 'faker';
// import * as bcrypt from 'bcrypt';

(async () => {
  // const app = await NestFactory.createApplicationContext(AppModule);

  // const userService = app.get(UsersService);

  // const password = await bcrypt.hash('1234', 12);

  for (let i = 0; i < 30; i++) {
    // await userService.save({
    //   first_name: faker.name.firstName(),
    //   last_name: faker.name.lastName(),
    //   email: faker.internet.email(),
    //   password,
    //   is_ambassador: true,
    // });
  }

  process.exit();
})();
