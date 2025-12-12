import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';

describe('UsersService', () => {
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UsersService],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an empty array initially', () => {
      const result = service.findAll();
      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });

    it('should return all users after creating some', () => {
      const user1: CreateUserDto = {
        name: 'John Doe',
        email: 'john@example.com',
        age: 30,
      };
      const user2: CreateUserDto = {
        name: 'Jane Smith',
        email: 'jane@example.com',
      };

      service.create(user1);
      service.create(user2);

      const result = service.findAll();
      expect(result).toHaveLength(2);
      expect(result[0].name).toBe('John Doe');
      expect(result[1].name).toBe('Jane Smith');
    });

    it('should return a copy of users array to prevent external mutation', () => {
      const user: CreateUserDto = {
        name: 'Test User',
        email: 'test@example.com',
      };
      service.create(user);

      const result1 = service.findAll();
      const result2 = service.findAll();

      expect(result1).toEqual(result2);
      expect(result1).not.toBe(result2); // Different array references
    });
  });

  describe('findOne', () => {
    it('should return undefined when user does not exist', () => {
      const result = service.findOne('999');
      expect(result).toBeUndefined();
    });

    it('should return the user when found by id', () => {
      const dto: CreateUserDto = {
        name: 'Alice Johnson',
        email: 'alice@example.com',
        age: 25,
      };
      const createdUser = service.create(dto);

      const result = service.findOne(createdUser.id);
      expect(result).toBeDefined();
      expect(result?.id).toBe(createdUser.id);
      expect(result?.name).toBe('Alice Johnson');
      expect(result?.email).toBe('alice@example.com');
      expect(result?.age).toBe(25);
    });

    it('should return undefined for non-existent id after creating users', () => {
      service.create({
        name: 'Bob',
        email: 'bob@example.com',
      });

      const result = service.findOne('999');
      expect(result).toBeUndefined();
    });

    it('should handle string id lookups correctly', () => {
      const user1 = service.create({
        name: 'User 1',
        email: 'user1@example.com',
      });
      const user2 = service.create({
        name: 'User 2',
        email: 'user2@example.com',
      });

      expect(service.findOne(user1.id)).toEqual(user1);
      expect(service.findOne(user2.id)).toEqual(user2);
    });

    it('should return correct user when multiple users exist', () => {
      service.create({ name: 'User A', email: 'a@example.com' });
      const targetUser = service.create({
        name: 'User B',
        email: 'b@example.com',
      });
      service.create({ name: 'User C', email: 'c@example.com' });

      const result = service.findOne(targetUser.id);
      expect(result?.name).toBe('User B');
    });
  });

  describe('create', () => {
    it('should create a user with all fields', () => {
      const dto: CreateUserDto = {
        name: 'Charlie Brown',
        email: 'charlie@example.com',
        age: 35,
      };

      const result = service.create(dto);

      expect(result).toBeDefined();
      expect(result.id).toBe('1');
      expect(result.name).toBe('Charlie Brown');
      expect(result.email).toBe('charlie@example.com');
      expect(result.age).toBe(35);
    });

    it('should create a user without optional age field', () => {
      const dto: CreateUserDto = {
        name: 'David Lee',
        email: 'david@example.com',
      };

      const result = service.create(dto);

      expect(result).toBeDefined();
      expect(result.id).toBe('1');
      expect(result.name).toBe('David Lee');
      expect(result.email).toBe('david@example.com');
      expect(result.age).toBeUndefined();
    });

    it('should auto-increment user ids', () => {
      const user1 = service.create({
        name: 'User 1',
        email: 'user1@example.com',
      });
      const user2 = service.create({
        name: 'User 2',
        email: 'user2@example.com',
      });
      const user3 = service.create({
        name: 'User 3',
        email: 'user3@example.com',
      });

      expect(user1.id).toBe('1');
      expect(user2.id).toBe('2');
      expect(user3.id).toBe('3');
    });

    it('should add user to the users array', () => {
      const dto: CreateUserDto = {
        name: 'Emily Clark',
        email: 'emily@example.com',
      };

      expect(service.findAll()).toHaveLength(0);

      service.create(dto);

      expect(service.findAll()).toHaveLength(1);
      expect(service.findAll()[0].name).toBe('Emily Clark');
    });

    it('should handle age as 0', () => {
      const dto: CreateUserDto = {
        name: 'Newborn',
        email: 'newborn@example.com',
        age: 0,
      };

      const result = service.create(dto);

      expect(result.age).toBe(0);
    });

    it('should handle negative age values', () => {
      const dto: CreateUserDto = {
        name: 'Future Person',
        email: 'future@example.com',
        age: -5,
      };

      const result = service.create(dto);

      expect(result.age).toBe(-5);
    });

    it('should handle very large age values', () => {
      const dto: CreateUserDto = {
        name: 'Ancient One',
        email: 'ancient@example.com',
        age: 9999,
      };

      const result = service.create(dto);

      expect(result.age).toBe(9999);
    });

    it('should handle empty string name', () => {
      const dto: CreateUserDto = {
        name: '',
        email: 'empty@example.com',
      };

      const result = service.create(dto);

      expect(result.name).toBe('');
    });

    it('should handle empty string email', () => {
      const dto: CreateUserDto = {
        name: 'No Email',
        email: '',
      };

      const result = service.create(dto);

      expect(result.email).toBe('');
    });

    it('should handle special characters in name', () => {
      const dto: CreateUserDto = {
        name: "O'Brien-Smith Jr. (III)",
        email: 'special@example.com',
      };

      const result = service.create(dto);

      expect(result.name).toBe("O'Brien-Smith Jr. (III)");
    });

    it('should handle special characters in email', () => {
      const dto: CreateUserDto = {
        name: 'Special Email',
        email: 'user+tag@sub.example.com',
      };

      const result = service.create(dto);

      expect(result.email).toBe('user+tag@sub.example.com');
    });

    it('should handle very long name strings', () => {
      const longName = 'A'.repeat(1000);
      const dto: CreateUserDto = {
        name: longName,
        email: 'long@example.com',
      };

      const result = service.create(dto);

      expect(result.name).toBe(longName);
      expect(result.name).toHaveLength(1000);
    });

    it('should handle very long email strings', () => {
      const longEmail = 'a'.repeat(500) + '@example.com';
      const dto: CreateUserDto = {
        name: 'Long Email User',
        email: longEmail,
      };

      const result = service.create(dto);

      expect(result.email).toBe(longEmail);
    });

    it('should handle Unicode characters in name', () => {
      const dto: CreateUserDto = {
        name: '李明 🎉',
        email: 'unicode@example.com',
      };

      const result = service.create(dto);

      expect(result.name).toBe('李明 🎉');
    });

    it('should allow duplicate names', () => {
      const user1 = service.create({
        name: 'John Doe',
        email: 'john1@example.com',
      });
      const user2 = service.create({
        name: 'John Doe',
        email: 'john2@example.com',
      });

      expect(user1.name).toBe(user2.name);
      expect(user1.id).not.toBe(user2.id);
    });

    it('should allow duplicate emails', () => {
      const user1 = service.create({
        name: 'User 1',
        email: 'duplicate@example.com',
      });
      const user2 = service.create({
        name: 'User 2',
        email: 'duplicate@example.com',
      });

      expect(user1.email).toBe(user2.email);
      expect(user1.id).not.toBe(user2.id);
    });

    it('should create multiple users in sequence', () => {
      const users = [];
      for (let i = 0; i < 10; i++) {
        users.push(
          service.create({
            name: `User ${i}`,
            email: `user${i}@example.com`,
            age: 20 + i,
          }),
        );
      }

      expect(service.findAll()).toHaveLength(10);
      expect(users[0].id).toBe('1');
      expect(users[9].id).toBe('10');
    });
  });

  describe('integration scenarios', () => {
    it('should support full CRUD workflow', () => {
      // Create
      const created = service.create({
        name: 'Workflow User',
        email: 'workflow@example.com',
        age: 28,
      });

      expect(created.id).toBeDefined();

      // Read All
      let allUsers = service.findAll();
      expect(allUsers).toHaveLength(1);

      // Read One
      const found = service.findOne(created.id);
      expect(found).toEqual(created);

      // Create more users
      service.create({
        name: 'Another User',
        email: 'another@example.com',
      });

      allUsers = service.findAll();
      expect(allUsers).toHaveLength(2);
    });

    it('should maintain data consistency across operations', () => {
      const user1 = service.create({
        name: 'User A',
        email: 'a@example.com',
      });
      const user2 = service.create({
        name: 'User B',
        email: 'b@example.com',
      });

      const allUsers = service.findAll();
      const foundUser1 = service.findOne(user1.id);
      const foundUser2 = service.findOne(user2.id);

      expect(allUsers).toContainEqual(foundUser1);
      expect(allUsers).toContainEqual(foundUser2);
    });

    it('should handle rapid consecutive creates', () => {
      const results = [];
      for (let i = 0; i < 100; i++) {
        results.push(
          service.create({
            name: `Rapid User ${i}`,
            email: `rapid${i}@example.com`,
          }),
        );
      }

      expect(results).toHaveLength(100);
      expect(service.findAll()).toHaveLength(100);
      expect(results[0].id).toBe('1');
      expect(results[99].id).toBe('100');
    });
  });
});