import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { Task } from './entities/task.entity';

@Injectable()
export class TaskService {
  private readonly logger = new Logger(TaskService.name);

  constructor(
    @InjectRepository(Task)
    private readonly taskService: Repository<Task>,
  ) {}

  async createOne(createTaskDto: CreateTaskDto) {
    try {
      const newTask = await this.taskService.create({
        ...createTaskDto,
      });
      await this.taskService.save(newTask);
      return newTask;
    } catch (error) {
      this.logger.warn(error);
      throw new HttpException(
        'Something went wrong',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findAll() {
    return this.taskService.find();
  }

  findOne(id: string) {
    return `This action returns a #${id} task`;
  }

  // update(id: string, updateTaskDto: UpdateTaskDto) {
  //   return `This action updates a #${id} task`;
  // }

  remove(id: string) {
    return `This action removes a #${id} task`;
  }
}
