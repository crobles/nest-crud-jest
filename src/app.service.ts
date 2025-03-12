import { Injectable } from '@nestjs/common';
import { HttpResponse } from './shared/httpResponse.interface';

@Injectable()
export class AppService {
  getHello(): HttpResponse {
    return { statusCode: 200, message: 'Hello World!' };
  }
}
