// users.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { HttpModule } from '@nestjs/axios';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UsersService } from '../service/users.service';
import { User } from '../entity/user.entity';
import { http, HttpResponse } from 'msw'; // Cambiado de 'rest' a 'http' y 'HttpResponse'
import { server } from '../__mocks__/server';

describe('UsersService', () => {
  let service: UsersService;

  // Mock para el repositorio
  const mockRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        // Usamos el HttpModule real, pero las peticiones serán interceptadas por MSW
        HttpModule,
      ],
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('sumar', () => {
    it('debería sumar dos números', () => {
      expect(service.sumar(3, 4)).toBe(7);
    });

    it('debería usar valores por defecto si no se proporcionan argumentos', () => {
      expect(service.sumar()).toBe(3); // 1 + 2 = 3
    });
  });

  describe('dolar', () => {
    it('debería obtener el valor del dólar para una fecha específica', async () => {
      const result = await service.dolar('01-01-2023');

      expect(result).toHaveProperty('serie');
      expect(result.serie[0].valor).toBe(855.86);
    });

    it('debería manejar errores 500 del servidor', async () => {
      await expect(service.dolar('error')).rejects.toThrow(
        'Error al obtener el dólar',
      );
    });

    it('debería manejar respuestas para fechas no encontradas', async () => {
      await expect(service.dolar('not-found')).rejects.toThrow(
        'Error al obtener el dólar',
      );
    });

    it('debería permitir sobreescribir la respuesta para un test específico', async () => {
      // Sobreescribimos temporalmente la respuesta para este test (actualizado para MSW v2)
      server.use(
        http.get('https://mindicador.cl/api/dolar/:fecha', () => {
          return HttpResponse.json({
            serie: [
              {
                fecha: '2023-05-15T03:00:00.000Z',
                valor: 795.32,
              },
            ],
          });
        }),
      );

      const result = await service.dolar('15-05-2023');

      expect(result).toHaveProperty('serie');
      expect(result.serie[0].valor).toBe(795.32);
    });
  });

  // Pruebas para los métodos CRUD
  describe('findAll', () => {
    it('debería devolver todos los usuarios', async () => {
      const mockUsers = [
        { id: 1, name: 'Test User', email: 'test@example.com' },
      ];
      mockRepository.find.mockResolvedValue(mockUsers);

      expect(await service.findAll()).toBe(mockUsers);
      expect(mockRepository.find).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('debería encontrar un usuario por id', async () => {
      const mockUser = { id: 1, name: 'Test User', email: 'test@example.com' };
      mockRepository.findOne.mockResolvedValue(mockUser);

      expect(await service.findOne(1)).toBe(mockUser);
      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
    });

    it('debería devolver null si el usuario no existe', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      expect(await service.findOne(999)).toBeNull();
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: 999 },
      });
    });
  });

  describe('create', () => {
    it('debería crear un nuevo usuario', async () => {
      const userData = { name: 'Nuevo Usuario', email: 'nuevo@example.com' };
      const createdUser = { id: 1, ...userData };

      mockRepository.create.mockReturnValue(userData);
      mockRepository.save.mockResolvedValue(createdUser);

      expect(await service.create(userData.name, userData.email)).toBe(
        createdUser,
      );
      expect(mockRepository.create).toHaveBeenCalledWith(userData);
      expect(mockRepository.save).toHaveBeenCalledWith(userData);
    });
  });

  describe('update', () => {
    it('debería actualizar un usuario existente', async () => {
      const existingUser = {
        id: 1,
        name: 'Usuario Antiguo',
        email: 'viejo@example.com',
      };
      const updatedUserData = {
        id: 1,
        name: 'Usuario Actualizado',
        email: 'nuevo@example.com',
      };

      mockRepository.findOne.mockResolvedValue(existingUser);
      mockRepository.save.mockResolvedValue(updatedUserData);

      const result = await service.update(
        1,
        'Usuario Actualizado',
        'nuevo@example.com',
      );

      expect(result).toBe(updatedUserData);
      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(mockRepository.save).toHaveBeenCalled();
    });

    it('debería devolver null si el usuario a actualizar no existe', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      const result = await service.update(
        999,
        'No existe',
        'noexiste@example.com',
      );

      expect(result).toBeNull();
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: 999 },
      });
      expect(mockRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('delete', () => {
    it('debería eliminar un usuario y devolver { deleted: true }', async () => {
      mockRepository.delete.mockResolvedValue({ affected: 1 });

      const result = await service.delete(1);

      expect(result).toEqual({ deleted: true });
      expect(mockRepository.delete).toHaveBeenCalledWith(1);
    });
  });
});
