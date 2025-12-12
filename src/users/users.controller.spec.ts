import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';

describe('UsersController', () => {
  let controller: UsersController;
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [UsersService],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an empty array when no users exist', () => {
      const result = controller.findAll();
      expect(result).toEqual([]);
    });

    it('should return all users', () => {
      const user1 = service.create({
        name: 'User 1',
        email: 'user1@example.com',
      });
      const user2 = service.create({
        name: 'User 2',
        email: 'user2@example.com',
        age: 30,
      });

      const result = controller.findAll();

      expect(result).toHaveLength(2);
      expect(result).toContainEqual(user1);
      expect(result).toContainEqual(user2);
    });

    it('should delegate to service.findAll', () => {
      const spy = jest.spyOn(service, 'findAll');
      controller.findAll();
      expect(spy).toHaveBeenCalledTimes(1);
    });

    it('should return users in order of creation', () => {
      service.create({ name: 'First', email: 'first@example.com' });
      service.create({ name: 'Second', email: 'second@example.com' });
      service.create({ name: 'Third', email: 'third@example.com' });

      const result = controller.findAll();

      expect(result[0].name).toBe('First');
      expect(result[1].name).toBe('Second');
      expect(result[2].name).toBe('Third');
    });
  });

  describe('findOne', () => {
    it('should return a user when found', () => {
      const created = service.create({
        name: 'John Doe',
        email: 'john@example.com',
        age: 25,
      });

      const result = controller.findOne(created.id);

      expect(result).toBeDefined();
      expect(result.id).toBe(created.id);
      expect(result.name).toBe('John Doe');
      expect(result.email).toBe('john@example.com');
      expect(result.age).toBe(25);
    });

    it('should throw NotFoundException when user does not exist', () => {
      expect(() => controller.findOne('999')).toThrow(NotFoundException);
    });

    it('should throw NotFoundException with correct message', () => {
      expect(() => controller.findOne('nonexistent')).toThrow('User not found');
    });

    it('should delegate to service.findOne with correct id', () => {
      const spy = jest.spyOn(service, 'findOne');
      const created = service.create({
        name: 'Test',
        email: 'test@example.com',
      });

      controller.findOne(created.id);

      expect(spy).toHaveBeenCalledWith(created.id);
    });

    it('should handle string ids correctly', () => {
      const user1 = service.create({
        name: 'User 1',
        email: 'user1@example.com',
      });
      const user2 = service.create({
        name: 'User 2',
        email: 'user2@example.com',
      });

      expect(controller.findOne(user1.id)).toEqual(user1);
      expect(controller.findOne(user2.id)).toEqual(user2);
    });

    it('should throw NotFoundException for empty string id', () => {
      expect(() => controller.findOne('')).toThrow(NotFoundException);
    });

    it('should throw NotFoundException for whitespace id', () => {
      expect(() => controller.findOne('   ')).toThrow(NotFoundException);
    });

    it('should handle numeric string ids', () => {
      const user = service.create({
        name: 'Numeric ID User',
        email: 'numeric@example.com',
      });

      const result = controller.findOne(user.id);
      expect(result).toEqual(user);
    });

    it('should throw NotFoundException after deleting a user (conceptually)', () => {
      const user = service.create({
        name: 'To Be Deleted',
        email: 'deleted@example.com',
      });

      // Verify it exists first
      expect(controller.findOne(user.id)).toEqual(user);

      // Simulate deletion by clearing the service
      // Note: The service doesn't have a delete method, but we can test the behavior
      // if a user is not found
      expect(() => controller.findOne('deleted-id')).toThrow(
        NotFoundException,
      );
    });
  });

  describe('create', () => {
    it('should create a user with all fields', () => {
      const dto: CreateUserDto = {
        name: 'Jane Smith',
        email: 'jane@example.com',
        age: 28,
      };

      const result = controller.create(dto);

      expect(result).toBeDefined();
      expect(result.id).toBe('1');
      expect(result.name).toBe('Jane Smith');
      expect(result.email).toBe('jane@example.com');
      expect(result.age).toBe(28);
    });

    it('should create a user without optional age', () => {
      const dto: CreateUserDto = {
        name: 'Bob Johnson',
        email: 'bob@example.com',
      };

      const result = controller.create(dto);

      expect(result).toBeDefined();
      expect(result.id).toBe('1');
      expect(result.name).toBe('Bob Johnson');
      expect(result.email).toBe('bob@example.com');
      expect(result.age).toBeUndefined();
    });

    it('should delegate to service.create', () => {
      const spy = jest.spyOn(service, 'create');
      const dto: CreateUserDto = {
        name: 'Test User',
        email: 'test@example.com',
      };

      controller.create(dto);

      expect(spy).toHaveBeenCalledWith(dto);
      expect(spy).toHaveBeenCalledTimes(1);
    });

    it('should return the created user', () => {
      const dto: CreateUserDto = {
        name: 'Alice Brown',
        email: 'alice@example.com',
        age: 35,
      };

      const result = controller.create(dto);

      expect(result.name).toBe(dto.name);
      expect(result.email).toBe(dto.email);
      expect(result.age).toBe(dto.age);
    });

    it('should auto-increment ids for multiple creates', () => {
      const result1 = controller.create({
        name: 'User 1',
        email: 'user1@example.com',
      });
      const result2 = controller.create({
        name: 'User 2',
        email: 'user2@example.com',
      });
      const result3 = controller.create({
        name: 'User 3',
        email: 'user3@example.com',
      });

      expect(result1.id).toBe('1');
      expect(result2.id).toBe('2');
      expect(result3.id).toBe('3');
    });

    it('should handle age as 0', () => {
      const dto: CreateUserDto = {
        name: 'Zero Age',
        email: 'zero@example.com',
        age: 0,
      };

      const result = controller.create(dto);
      expect(result.age).toBe(0);
    });

    it('should handle negative age', () => {
      const dto: CreateUserDto = {
        name: 'Negative Age',
        email: 'negative@example.com',
        age: -10,
      };

      const result = controller.create(dto);
      expect(result.age).toBe(-10);
    });

    it('should handle empty string name', () => {
      const dto: CreateUserDto = {
        name: '',
        email: 'empty@example.com',
      };

      const result = controller.create(dto);
      expect(result.name).toBe('');
    });

    it('should handle empty string email', () => {
      const dto: CreateUserDto = {
        name: 'No Email',
        email: '',
      };

      const result = controller.create(dto);
      expect(result.email).toBe('');
    });

    it('should handle special characters in name', () => {
      const dto: CreateUserDto = {
        name: "O'Malley-Jones (Sr.)",
        email: 'special@example.com',
      };

      const result = controller.create(dto);
      expect(result.name).toBe("O'Malley-Jones (Sr.)");
    });

    it('should handle Unicode characters', () => {
      const dto: CreateUserDto = {
        name: '山田太郎',
        email: 'yamada@example.jp',
      };

      const result = controller.create(dto);
      expect(result.name).toBe('山田太郎');
    });

    it('should handle very long strings', () => {
      const longName = 'A'.repeat(1000);
      const dto: CreateUserDto = {
        name: longName,
        email: 'long@example.com',
      };

      const result = controller.create(dto);
      expect(result.name).toHaveLength(1000);
    });

    it('should allow duplicate names', () => {
      const user1 = controller.create({
        name: 'Duplicate Name',
        email: 'email1@example.com',
      });
      const user2 = controller.create({
        name: 'Duplicate Name',
        email: 'email2@example.com',
      });

      expect(user1.name).toBe(user2.name);
      expect(user1.id).not.toBe(user2.id);
    });

    it('should allow duplicate emails', () => {
      const user1 = controller.create({
        name: 'Name 1',
        email: 'duplicate@example.com',
      });
      const user2 = controller.create({
        name: 'Name 2',
        email: 'duplicate@example.com',
      });

      expect(user1.email).toBe(user2.email);
      expect(user1.id).not.toBe(user2.id);
    });

    it('should handle rapid consecutive creates', () => {
      const results = [];
      for (let i = 0; i < 50; i++) {
        results.push(
          controller.create({
            name: `Rapid ${i}`,
            email: `rapid${i}@example.com`,
          }),
        );
      }

      expect(results).toHaveLength(50);
      expect(results[0].id).toBe('1');
      expect(results[49].id).toBe('50');
    });
  });

  describe('integration scenarios', () => {
    it('should support create and findOne workflow', () => {
      const dto: CreateUserDto = {
        name: 'Integration User',
        email: 'integration@example.com',
        age: 40,
      };

      const created = controller.create(dto);
      const found = controller.findOne(created.id);

      expect(found).toEqual(created);
    });

    it('should support create and findAll workflow', () => {
      controller.create({
        name: 'User A',
        email: 'a@example.com',
      });
      controller.create({
        name: 'User B',
        email: 'b@example.com',
      });

      const all = controller.findAll();

      expect(all).toHaveLength(2);
      expect(all[0].name).toBe('User A');
      expect(all[1].name).toBe('User B');
    });

    it('should maintain consistency across multiple operations', () => {
      const user1 = controller.create({
        name: 'Consistency User 1',
        email: 'c1@example.com',
      });
      const user2 = controller.create({
        name: 'Consistency User 2',
        email: 'c2@example.com',
      });

      const allUsers = controller.findAll();
      const foundUser1 = controller.findOne(user1.id);
      const foundUser2 = controller.findOne(user2.id);

      expect(allUsers).toContainEqual(foundUser1);
      expect(allUsers).toContainEqual(foundUser2);
      expect(allUsers).toHaveLength(2);
    });

    it('should handle mixed operations in sequence', () => {
      // Create
      const user1 = controller.create({
        name: 'Mixed 1',
        email: 'm1@example.com',
      });

      // FindOne
      const found1 = controller.findOne(user1.id);
      expect(found1).toEqual(user1);

      // FindAll
      let all = controller.findAll();
      expect(all).toHaveLength(1);

      // Create more
      const user2 = controller.create({
        name: 'Mixed 2',
        email: 'm2@example.com',
      });
      const user3 = controller.create({
        name: 'Mixed 3',
        email: 'm3@example.com',
      });

      // FindAll again
      all = controller.findAll();
      expect(all).toHaveLength(3);

      // FindOne for each
      expect(controller.findOne(user1.id)).toEqual(user1);
      expect(controller.findOne(user2.id)).toEqual(user2);
      expect(controller.findOne(user3.id)).toEqual(user3);
    });

    it('should throw NotFoundException when querying non-existent user after creates', () => {
      controller.create({
        name: 'Existing User',
        email: 'existing@example.com',
      });

      expect(() => controller.findOne('999')).toThrow(NotFoundException);
    });
  });

  describe('error handling', () => {
    it('should throw NotFoundException and not crash on invalid id', () => {
      expect(() => controller.findOne('invalid')).toThrow(NotFoundException);

      // Should still work after exception
      const user = controller.create({
        name: 'After Error',
        email: 'after@example.com',
      });
      expect(controller.findOne(user.id)).toEqual(user);
    });

    it('should handle multiple NotFoundException throws', () => {
      expect(() => controller.findOne('1')).toThrow(NotFoundException);
      expect(() => controller.findOne('2')).toThrow(NotFoundException);
      expect(() => controller.findOne('3')).toThrow(NotFoundException);

      // Service should still function
      expect(controller.findAll()).toEqual([]);
    });
  });

  describe('service dependency', () => {
    it('should use the injected service instance', () => {
      expect(controller['usersService']).toBe(service);
    });

    it('should share state with service', () => {
      // Create via controller
      const controllerCreated = controller.create({
        name: 'Controller Created',
        email: 'controller@example.com',
      });

      // Should be visible via direct service call
      const serviceFound = service.findOne(controllerCreated.id);
      expect(serviceFound).toEqual(controllerCreated);

      // Create via service
      const serviceCreated = service.create({
        name: 'Service Created',
        email: 'service@example.com',
      });

      // Should be visible via controller
      const controllerFound = controller.findOne(serviceCreated.id);
      expect(controllerFound).toEqual(serviceCreated);
    });
  });
});