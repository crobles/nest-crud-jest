import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entity/user.entity';

import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    private readonly httpService: HttpService,
  ) {}

  findAll() {
    return this.userRepository.find();
  }

  findOne(id: number) {
    return this.userRepository.findOne({ where: { id } });
  }

  create(name: string, email: string) {
    const user = this.userRepository.create({ name, email });
    return this.userRepository.save(user);
  }

  async update(id: number, name: string, email: string) {
    const user = await this.findOne(id);
    if (!user) return null;
    user.name = name;
    user.email = email;
    return this.userRepository.save(user);
  }

  async delete(id: number): Promise<{ deleted: boolean }> {
    return this.userRepository.delete(id).then(() => ({ deleted: true }));
  }

  sumar(number1: number = 1, number2: number = 2): number {
    const result = number1 + number2;
    return result;
  }

  async dolar(fecha: string): Promise<any> {
    const url = `https://mindicador.cl/api/dolar/${fecha}`;

    try {
      const response = await lastValueFrom(this.httpService.get(url));
      return response.data;
    } catch (error) {
      throw new Error(`Error al obtener el dólar: ${error.message}`);
    }
  }
}
