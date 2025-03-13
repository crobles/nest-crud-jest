import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsersService } from '../service/users.service';
import { User } from '../entity/user.entity';
import { HttpService } from '@nestjs/axios';
import { of } from 'rxjs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { AxiosResponse } from 'axios';

jest.setTimeout(60000);

describe('UsersService', () => {
  let service: UsersService;
  let userRepository: Repository<User>;
  let httpService: HttpService;
  let module: TestingModule;

  beforeAll(async () => {
    try {
      module = await Test.createTestingModule({
        imports: [
          TypeOrmModule.forRoot({
            type: 'mysql',
            host: '127.0.0.1', // Usar IPv4 explícitamente
            port: 3307,
            username: 'testuser',
            password: 'testpass',
            database: 'testdb',
            entities: [User],
            synchronize: true,
            connectTimeout: 60000,
          }),
          TypeOrmModule.forFeature([User]),
          HttpModule,
        ],
        providers: [UsersService],
      }).compile();

      service = module.get<UsersService>(UsersService);
      userRepository = module.get<Repository<User>>(getRepositoryToken(User));
      httpService = module.get<HttpService>(HttpService);
    } catch (error) {
      console.error(
        'Error en la configuración del módulo UsersService:',
        error,
      );
      throw error;
    }
  });

  afterAll(async () => {
    try {
      if (module) {
        await module.close();
      }
    } catch (error) {
      console.error('Error al cerrar el módulo UsersService:', error);
    }
  });

  beforeEach(async () => {
    try {
      await userRepository.query('DELETE FROM user');
    } catch (error) {
      console.warn('Advertencia al limpiar la tabla:', error.message);
    }
  });

  describe('Operaciones CRUD', () => {
    it('should create a user', async () => {
      const user = await service.create('Test User', 'test@example.com');

      expect(user).toBeDefined();
      expect(user.id).toBeDefined();
      expect(user.name).toBe('Test User');
      expect(user.email).toBe('test@example.com');
    });

    it('should find all users', async () => {
      await service.create('User 1', 'user1@example.com');
      await service.create('User 2', 'user2@example.com');
      const users = await service.findAll();

      expect(users).toBeDefined();
      expect(users.length).toBe(2);
      expect(users[0].name).toBe('User 1');
      expect(users[1].name).toBe('User 2');
    });

    it('should find one user by id', async () => {
      const createdUser = await service.create('Find Me', 'findme@example.com');
      const foundUser = await service.findOne(createdUser.id);
      expect(foundUser).toBeDefined();
      expect(foundUser.id).toBe(createdUser.id);
      expect(foundUser.name).toBe('Find Me');
    });

    it('should update a user', async () => {
      const user = await service.create('Before Update', 'before@example.com');

      const updatedUser = await service.update(
        user.id,
        'After Update',
        'after@example.com',
      );

      expect(updatedUser).toBeDefined();
      expect(updatedUser.id).toBe(user.id);
      expect(updatedUser.name).toBe('After Update');
      expect(updatedUser.email).toBe('after@example.com');
    });

    it('should delete a user', async () => {
      const user = await service.create('Delete Me', 'delete@example.com');
      const result = await service.delete(user.id);
      expect(result).toEqual({ deleted: true });
      const deletedUser = await service.findOne(user.id);
      expect(deletedUser).toBeNull();
    });
  });

  describe('sumar', () => {
    it('should sum two numbers correctly', () => {
      jest.spyOn(service, 'sumar');

      const result = service.sumar(5, 7);
      expect(service.sumar).toHaveBeenCalledWith(5, 7);
      expect(result).toBe(12);
    });

    it('should use default values if no parameters are provided', () => {
      jest.spyOn(service, 'sumar');

      const result = service.sumar();
      expect(service.sumar).toHaveBeenCalledWith();
      expect(result).toBe(3);
    });
  });

  describe('dolar', () => {
    it('should fetch dollar exchange rate successfully', async () => {
      const mockResponseData = {
        version: '1.7.0',
        autor: 'mindicador.cl',
        codigo: 'dolar',
        nombre: 'Dólar observado',
        unidad_medida: 'Pesos',
        serie: [
          {
            fecha: '2023-03-01T03:00:00.000Z',
            valor: 829.97,
          },
        ],
      };

      const mockAxiosResponse: AxiosResponse = {
        data: mockResponseData,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: { url: 'https://mindicador.cl/api/dolar/01-03-2023' } as any,
      };

      jest
        .spyOn(httpService, 'get')
        .mockImplementationOnce(() => of(mockAxiosResponse));

      const result = await service.dolar('01-03-2023');

      expect(httpService.get).toHaveBeenCalledWith(
        'https://mindicador.cl/api/dolar/01-03-2023',
      );

      expect(result).toEqual(mockResponseData);
    });

    it('should throw an error when API call fails', async () => {
      jest.spyOn(httpService, 'get').mockImplementationOnce(() => {
        throw new Error('API request failed');
      });

      await expect(service.dolar('01-03-2023')).rejects.toThrow(
        'Error al obtener el dólar: API request failed',
      );
    });
  });
});
