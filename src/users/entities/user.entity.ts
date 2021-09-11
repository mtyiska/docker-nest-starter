import { Exclude } from 'class-transformer';
import { Order } from 'src/order/entities/order.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  first_name: string;

  @Column()
  last_name: string;

  @Column({ unique: true })
  email: string;

  // @Column({ select: false })
  @Column()
  @Exclude()
  password: string;

  @Column({ default: true })
  is_ambassador: boolean;

  @OneToMany(() => Order, (order) => order.user, {
    createForeignKeyConstraints: false,
  })
  orders: Order[];

  // get revenue(): number {
  //   return this.orders
  //     .filter((o) => o.complete)
  //     .reduce((s, o) => s + o.ambassador_revenue, 0);
  // }

  get name() {
    return `${this.first_name} ${this.last_name}`;
  }
}
