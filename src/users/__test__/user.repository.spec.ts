import { Test, TestingModule } from '@nestjs/testing';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../entity/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StartedTestContainer } from 'testcontainers';
import { PostgreSqlContainer } from '@testcontainers/postgresql';
import { HttpModule } from '@nestjs/axios';

jest.setTimeout(60000);

describe('User Entity Repository with Docker Compose', () => {
  let userRepository: Repository<User>;
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
      }).compile();

      userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    } catch (error) {
      console.error(
        'Error en la configuración del módulo User Repository:',
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
      console.error('Error al cerrar el módulo User Repository:', error);
    }
  });

  beforeEach(async () => {
    if (userRepository) {
      try {
        await userRepository.query('DELETE FROM user');
      } catch (error) {
        console.warn('Error limpiando tabla user:', error.message);
      }
    }
  });

  it('should create and save a user', async () => {
    const user = userRepository.create({
      name: 'John Doe',
      email: 'john@example.com',
    });
    const savedUser = await userRepository.save(user);

    expect(savedUser.id).toBeDefined();
    expect(savedUser.name).toBe('John Doe');
    expect(savedUser.email).toBe('john@example.com');
  });

  it('should throw an error when saving a user without email', async () => {
    const user = userRepository.create({ name: 'Jane Doe' });

    await expect(userRepository.save(user)).rejects.toThrow();
  });

  it('should find a user by email', async () => {
    const user = userRepository.create({
      name: 'Alice',
      email: 'alice@example.com',
    });
    await userRepository.save(user);

    const foundUser = await userRepository.findOne({
      where: { email: 'alice@example.com' },
    });
    expect(foundUser).toBeDefined();
    expect(foundUser?.name).toBe('Alice');
  });

  it('should not allow duplicate emails', async () => {
    const user1 = userRepository.create({
      name: 'User One',
      email: 'duplicate@example.com',
    });
    const user2 = userRepository.create({
      name: 'User Two',
      email: 'duplicate@example.com',
    });

    await userRepository.save(user1);
    await expect(userRepository.save(user2)).rejects.toThrow();
  });

  it('should delete a user', async () => {
    const user = userRepository.create({
      name: 'Delete Me',
      email: 'delete@example.com',
    });
    await userRepository.save(user);

    await userRepository.delete(user.id);

    const deletedUser = await userRepository.findOne({
      where: { id: user.id },
    });
    expect(deletedUser).toBeNull();
  });
});

// solo son muestras para pruebas con postgres si quisieran profundizar en esto
describe.skip('User Entity Repository with Testcontainers with postgres', () => {
  let userRepository: Repository<User>;
  let postgresContainer: StartedTestContainer;
  let dbHost: string;
  let dbPort: number;

  beforeAll(async () => {
    postgresContainer = await new PostgreSqlContainer()
      .withDatabase('testdb')
      .withUsername('testuser')
      .withPassword('testpass')
      .start();

    dbHost = postgresContainer.getHost();
    dbPort = postgresContainer.getMappedPort(5432);

    console.log(`🚀 PostgreSQL iniciado en ${dbHost}:${dbPort}`);
  });

  afterAll(async () => {
    await postgresContainer.stop();
    console.log('🛑 PostgreSQL detenido');
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'postgres',
          host: dbHost,
          port: dbPort,
          username: 'testuser',
          password: 'testpass',
          database: 'testdb',
          entities: [User],
          synchronize: true,
        }),
        TypeOrmModule.forFeature([User]),
      ],
    }).compile();

    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  afterEach(async () => {
    await userRepository.query(`DELETE FROM "user"`);
  });

  it.only('should create and save a user', async () => {
    const user = userRepository.create({
      name: 'John Doe',
      email: 'john@example.com',
    });
    const savedUser = await userRepository.save(user);

    expect(savedUser.id).toBeDefined();
    expect(savedUser.name).toBe('John Doe');
    expect(savedUser.email).toBe('john@example.com');
  });

  it('should throw an error when saving a user without email', async () => {
    const user = userRepository.create({ name: 'Jane Doe' });

    await expect(userRepository.save(user)).rejects.toThrow();
  });

  it('should find a user by email', async () => {
    const user = userRepository.create({
      name: 'Alice',
      email: 'alice@example.com',
    });
    await userRepository.save(user);

    const foundUser = await userRepository.findOne({
      where: { email: 'alice@example.com' },
    });
    expect(foundUser).toBeDefined();
    expect(foundUser?.name).toBe('Alice');
  });

  it('should not allow duplicate emails', async () => {
    const user1 = userRepository.create({
      name: 'User One',
      email: 'duplicate@example.com',
    });
    const user2 = userRepository.create({
      name: 'User Two',
      email: 'duplicate@example.com',
    });

    await userRepository.save(user1);
    await expect(userRepository.save(user2)).rejects.toThrow();
  });

  it('should delete a user', async () => {
    const user = userRepository.create({
      name: 'Delete Me',
      email: 'delete@example.com',
    });
    await userRepository.save(user);

    await userRepository.delete(user.id);

    const deletedUser = await userRepository.findOne({
      where: { id: user.id },
    });
    expect(deletedUser).toBeNull();
  });
});
