import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      autoLoadEntities: true,
      entities: [__dirname + '../**/*.entity{.ts,.js}'],
      synchronize: true,
      // you can disable this if you prefer running migration manually.
      migrationsRun: false,
      logging: true,
      logger: 'file',
      // dropSchema: true,
      // // Allow both start:prod and start:dev to use migrations
      // // __dirname is either dist or src folder, meaning either
      // // the compiled js in prod or the ts in dev.
      // migrations: [__dirname + '/migrations/**/*{.ts,.js}'],
      // cli: {
      //   // Location of migration should be inside src folder
      //   // to be compiled into dist/ folder.
      //   migrationsDir: 'src/migrations',
      // },
    }),
  ],
})
export class DatabaseModule {}
