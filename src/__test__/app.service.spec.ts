import { Test, TestingModule } from '@nestjs/testing';
import { AppService } from '../app.service';
import { HttpResponse } from '../shared/httpResponse.interface';

describe('AppService', () => {
  let service: AppService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AppService],
    }).compile();

    service = module.get<AppService>(AppService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return "Hello World!" with HTTP 200', () => {
    const response: HttpResponse = service.getHello();
    expect(response.statusCode).toBe(200);
    expect(response.message).toBe('Hello World!');
  });

  it('should NOT return "Goodbye World!" with HTTP 200', () => {
    const response: HttpResponse = service.getHello();
    expect(response.statusCode).toBe(200);
    expect(response.message).not.toBe('Goodbye World!');
  });

  it('should throw an error when the service fails (simulate HTTP 500)', () => {
    jest.spyOn(service, 'getHello').mockImplementation(() => {
      throw new Error('Internal Server Error');
    });

    expect(() => service.getHello()).toThrow('Internal Server Error');
  });

  it('should NOT return a number', () => {
    const response: HttpResponse = service.getHello();
    expect(typeof response.message).not.toBe('number');
  });

  it('should return "Not Found" when resource is missing (simulate HTTP 404)', () => {
    jest.spyOn(service, 'getHello').mockImplementation(() => {
      return { statusCode: 404, message: 'Not Found' };
    });

    const response = service.getHello();
    expect(response.statusCode).toBe(404);
    expect(response.message).toBe('Not Found');
  });
});
