import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';

type User = {
  id: string;
  name: string;
  email: string;
  age?: number;
};

@Injectable()
export class UsersService {
  private users: User[] = [];
  private nextId = 1;

  findAll(): User[] {
    return this.users;
  }

  findOne(id: string): User | undefined {
    return this.users.find((u) => u.id === id);
  }

  create(dto: CreateUserDto): User {
    const user: User = {
      id: String(this.nextId++),
      name: dto.name,
      email: dto.email,
      age: dto.age,
    };
    this.users.push(user);
    return user;
  }
}