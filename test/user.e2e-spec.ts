// test/user.e2e-spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../src/users/entity/user.entity';
import { UsersService } from '../src/users/service/users.service';
import { UsersController } from '../src/users/controller/users.controller';
import { HttpService } from '@nestjs/axios';
import { of } from 'rxjs';

describe('UsersController (e2e)', () => {
  let app: INestApplication;

  // Mock de usuarios para las pruebas
  const mockUsers = [
    { id: 1, name: 'Usuario 1', email: 'user1@example.com' },
    { id: 2, name: 'Usuario 2', email: 'user2@example.com' },
  ];

  // Mock para el repositorio
  const mockRepository = {
    find: jest.fn().mockResolvedValue(mockUsers),
    findOne: jest.fn().mockImplementation(({ where: { id } }) => {
      const user = mockUsers.find((user) => user.id === +id);
      return Promise.resolve(user);
    }),
    create: jest.fn().mockImplementation((userData) => userData),
    save: jest.fn().mockImplementation((userData) => {
      if (userData.id) {
        // Actualización
        const index = mockUsers.findIndex((user) => user.id === userData.id);
        if (index !== -1) {
          mockUsers[index] = { ...mockUsers[index], ...userData };
          return Promise.resolve(mockUsers[index]);
        }
        return Promise.resolve(null);
      } else {
        // Creación
        const newUser = { id: mockUsers.length + 1, ...userData };
        mockUsers.push(newUser);
        return Promise.resolve(newUser);
      }
    }),
    delete: jest.fn().mockImplementation((id) => {
      const index = mockUsers.findIndex((user) => user.id === +id);
      if (index !== -1) {
        mockUsers.splice(index, 1);
      }
      return Promise.resolve({ affected: 1 });
    }),
  };

  // Mock para HttpService
  const mockHttpService = {
    get: jest.fn().mockImplementation((url) => {
      if (url.includes('01-01-2023')) {
        return of({
          data: {
            serie: [
              {
                fecha: '2023-01-01T03:00:00.000Z',
                valor: 855.86,
              },
            ],
          },
          status: 200,
        });
      }
      return of({
        data: {
          serie: [
            {
              fecha: new Date().toISOString(),
              valor: 800,
            },
          ],
        },
        status: 200,
      });
    }),
  };

  beforeAll(async () => {
    // Configurar el módulo de prueba sin usar AppModule
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: mockRepository,
        },
        {
          provide: HttpService,
          useValue: mockHttpService,
        },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('/users (GET)', () => {
    it('debería devolver un array de usuarios', () => {
      return request(app.getHttpServer())
        .get('/users')
        .expect(200)
        .expect(mockUsers);
    });
  });

  describe('/users/:id (GET)', () => {
    it('debería devolver un usuario por ID', () => {
      return request(app.getHttpServer())
        .get('/users/1')
        .expect(200)
        .expect(mockUsers[0]);
    });

    it('debería devolver un objeto vacío si el usuario no existe', () => {
      mockRepository.findOne.mockResolvedValueOnce(null);

      return request(app.getHttpServer())
        .get('/users/999')
        .expect(200)
        .expect({}); // Esperar un objeto vacío en lugar de null
    });
  });

  describe('/users (POST)', () => {
    it('debería crear un nuevo usuario', () => {
      const newUser = {
        name: 'Nuevo Usuario',
        email: 'nuevo@example.com',
      };

      return request(app.getHttpServer())
        .post('/users')
        .send(newUser)
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body.name).toBe(newUser.name);
          expect(res.body.email).toBe(newUser.email);
        });
    });
  });

  describe('/users/:id (PUT)', () => {
    it('debería actualizar un usuario existente', () => {
      const updatedData = {
        name: 'Usuario 1 Actualizado',
        email: 'updated1@example.com',
      };

      return request(app.getHttpServer())
        .put('/users/1')
        .send(updatedData)
        .expect(200)
        .expect((res) => {
          expect(res.body.id).toBe(1);
          expect(res.body.name).toBe(updatedData.name);
          expect(res.body.email).toBe(updatedData.email);
        });
    });

    it('debería devolver un objeto vacío cuando se intenta actualizar un usuario que no existe', () => {
      mockRepository.findOne.mockResolvedValueOnce(null);

      return request(app.getHttpServer())
        .put('/users/999')
        .send({ name: 'No existe', email: 'noexiste@example.com' })
        .expect(200)
        .expect({}); // Esperar un objeto vacío en lugar de null
    });
  });

  describe('/users/:id (DELETE)', () => {
    it('debería eliminar un usuario existente', () => {
      return request(app.getHttpServer())
        .delete('/users/1')
        .expect(200)
        .expect({ deleted: true });
    });
  });
});
