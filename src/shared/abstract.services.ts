import { Repository } from 'typeorm';

export abstract class AbstractService {
  protected constructor(protected readonly repository: Repository<any>) {}

  async save(options) {
    return this.repository.save(options);
  }
  async findAll() {
    return this.repository.find();
  }

  async find(options) {
    return this.repository.find(options);
  }

  async findOne(options) {
    return this.repository.findOne(options);
  }

  async update(id: string, options) {
    return this.repository.update(id, options);
  }

  async remove(id: string) {
    return this.repository.remove(id);
  }
}
