// users.controller.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { HttpModule } from '@nestjs/axios';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UsersController } from '../controller/users.controller';
import { UsersService } from '../service/users.service';
import { User } from '../entity/user.entity';

describe('UsersController', () => {
  let controller: UsersController;
  let service: UsersService;

  // Mock para el repositorio
  const mockRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    delete: jest.fn(),
  };

  // Configuración de las pruebas
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [HttpModule],
      controllers: [UsersController],
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: mockRepository,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get<UsersService>(UsersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getAll', () => {
    it('debería devolver un array de usuarios', async () => {
      const result = [{ id: 1, name: 'Test', email: 'test@example.com' }];
      jest
        .spyOn(service, 'findAll')
        .mockImplementation(() => Promise.resolve(result));

      expect(await controller.getAll()).toBe(result);
    });
  });

  describe('getOne', () => {
    it('debería devolver un único usuario', async () => {
      const result = { id: 1, name: 'Test', email: 'test@example.com' };
      jest
        .spyOn(service, 'findOne')
        .mockImplementation(() => Promise.resolve(result));

      expect(await controller.getOne(1)).toBe(result);
    });

    it('debería devolver null cuando el usuario no existe', async () => {
      jest
        .spyOn(service, 'findOne')
        .mockImplementation(() => Promise.resolve(null));

      expect(await controller.getOne(999)).toBeNull();
    });
  });

  describe('create', () => {
    it('debería crear un usuario', async () => {
      const userData = { name: 'Nuevo', email: 'nuevo@example.com' };
      const result = { id: 1, ...userData };

      jest
        .spyOn(service, 'create')
        .mockImplementation(() => Promise.resolve(result));

      expect(await controller.create(userData)).toBe(result);
      expect(service.create).toHaveBeenCalledWith(
        userData.name,
        userData.email,
      );
    });
  });

  describe('update', () => {
    it('debería actualizar un usuario', async () => {
      const userData = {
        name: 'Actualizado',
        email: 'actualizado@example.com',
      };
      const result = { id: 1, ...userData };

      jest
        .spyOn(service, 'update')
        .mockImplementation(() => Promise.resolve(result));

      expect(await controller.update(1, userData)).toBe(result);
      expect(service.update).toHaveBeenCalledWith(
        1,
        userData.name,
        userData.email,
      );
    });

    it('debería devolver null cuando el usuario a actualizar no existe', async () => {
      jest
        .spyOn(service, 'update')
        .mockImplementation(() => Promise.resolve(null));

      expect(
        await controller.update(999, {
          name: 'No existe',
          email: 'noexiste@example.com',
        }),
      ).toBeNull();
    });
  });

  describe('delete', () => {
    it('debería eliminar un usuario', async () => {
      const result = { deleted: true };
      jest
        .spyOn(service, 'delete')
        .mockImplementation(() => Promise.resolve(result));

      expect(await controller.delete(1)).toBe(result);
      expect(service.delete).toHaveBeenCalledWith(1);
    });
  });
});
