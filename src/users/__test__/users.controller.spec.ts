import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from '../controller/users.controller';
import { UsersService } from '../service/users.service';
import {
  mockUsers,
  mockSingleUser,
  mockNewUser,
  mockUpdatedUser,
} from '../__mocks__/user-mock-data';

describe('UsersController', () => {
  let usersController: UsersController;
  let usersService: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: {
            findAll: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
          },
        },
      ],
    }).compile();

    usersController = module.get<UsersController>(UsersController);
    usersService = module.get<UsersService>(UsersService);
  });

  it('should return an array of users', async () => {
    jest.spyOn(usersService, 'findAll').mockResolvedValue(mockUsers);

    expect(await usersController.getAll()).toEqual(mockUsers);
    expect(usersService.findAll).toHaveBeenCalled();
  });

  it('should return a single user', async () => {
    jest.spyOn(usersService, 'findOne').mockResolvedValue(mockSingleUser);

    expect(await usersController.getOne(1)).toEqual(mockSingleUser);
    expect(usersService.findOne).toHaveBeenCalledWith(1);
  });

  it('should create a new user', async () => {
    jest.spyOn(usersService, 'create').mockResolvedValue(mockNewUser);

    expect(await usersController.create(mockNewUser)).toEqual(mockNewUser);
    expect(usersService.create).toHaveBeenCalledWith(
      mockNewUser.name,
      mockNewUser.email,
    );
  });

  it('should update a user', async () => {
    jest.spyOn(usersService, 'update').mockResolvedValue(mockUpdatedUser);

    expect(await usersController.update(1, mockUpdatedUser)).toEqual(
      mockUpdatedUser,
    );
    expect(usersService.update).toHaveBeenCalledWith(
      1,
      mockUpdatedUser.name,
      mockUpdatedUser.email,
    );
  });

  it('should delete a user', async () => {
    jest.spyOn(usersService, 'delete').mockResolvedValue({ deleted: true });

    expect(await usersController.delete(1)).toEqual({ deleted: true });
    expect(usersService.delete).toHaveBeenCalledWith(1);
  });
});
