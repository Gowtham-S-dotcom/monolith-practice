import { Injectable } from '@nestjs/common';
import { CreateItemDto } from './dto/create-item.dto';

type Item = {
  id: string;
  name: string;
  description?: string;
};

@Injectable()
export class ItemsService {
  private items: Item[] = [];
  private nextId = 1;

  findAll(): Item[] {
    return this.items;
  }

  findOne(id: string): Item | undefined {
    return this.items.find((i) => i.id === id);
  }

  create(dto: CreateItemDto): Item {
    const item: Item = {
      id: String(this.nextId++),
      name: dto.name,
      description: dto.description,
    };
    this.items.push(item);
    return item;
  }
}
