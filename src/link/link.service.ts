import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AbstractService } from 'src/shared/abstract.services';
import { Repository } from 'typeorm';
import { Link } from './entities/link.entity';

@Injectable()
export class LinkService extends AbstractService {
  constructor(
    @InjectRepository(Link) private readonly linkRepository: Repository<Link>,
  ) {
    super(linkRepository);
  }
}
