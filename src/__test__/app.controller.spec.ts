import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from '../app.controller';
import { AppService } from '../app.service';
import { HttpResponse } from '../shared/httpResponse.interface';

describe('AppController', () => {
  let appController: AppController;
  let service: AppService;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
    service = app.get<AppService>(AppService);
  });

  describe('root getHello()', () => {
    it('should return an HttpResponse with statusCode 200 and message "Hello World!"', () => {
      const response: HttpResponse = appController.getHello();
      expect(response).toEqual({ statusCode: 200, message: 'Hello World!' });
    });

    it('should return an HttpResponse with statusCode 404', () => {
      jest.spyOn(service, 'getHello').mockImplementation(() => {
        return { statusCode: 404, message: 'Not Found' };
      });
      const response = service.getHello();
      expect(response.statusCode).toBe(404);
      expect(response.message).toBe('Not Found');
    });

    it('should return an HttpResponse with statusCode 200 but with another message', () => {
      jest.spyOn(service, 'getHello').mockImplementation(() => {
        return { statusCode: 200, message: 'Not Hello world' };
      });
      const response = service.getHello();
      expect(response.statusCode).toBe(200);
      expect(response.message).toBe('Not Hello world');
    });
  });
});
