import { Injectable } from '@nestjs/common';
import { userInterface } from './interface/usersinterface';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from 'src/user/entities/user.entity';


@Injectable()
export class SeedService {
  constructor(
        @InjectModel( User.name)
        private readonly UserModel : Model<User>    
      ){}

    private usersPrueba : userInterface[] = [
      { "name": "Carlos", "lastname": "García", "codigo": 1 },
      { "name": "María", "lastname": "López", "codigo": 2 },
      { "name": "Javier", "lastname": "Martínez", "codigo": 3 },
      { "name": "Lucía", "lastname": "Fernández", "codigo": 4 },
      { "name": "Andrés", "lastname": "Pérez", "codigo": 5 },
      { "name": "Sofía", "lastname": "Ruiz", "codigo": 6 },
      { "name": "Miguel", "lastname": "Torres", "codigo": 7 },
      { "name": "Valentina", "lastname": "Ramírez", "codigo": 8 },
      { "name": "Diego", "lastname": "Flores", "codigo": 9 },
      { "name": "Camila", "lastname": "Jiménez", "codigo": 10 },
      { "name": "Fernando", "lastname": "Gómez", "codigo": 11 },
      { "name": "Isabella", "lastname": "Morales", "codigo": 12 },
      { "name": "Ricardo", "lastname": "Cortés", "codigo": 13 },
      { "name": "Natalia", "lastname": "Castro", "codigo": 14 },
      { "name": "Alejandro", "lastname": "Sánchez", "codigo": 15 },
      { "name": "Daniela", "lastname": "Navarro", "codigo": 16 },
      { "name": "Tomás", "lastname": "Mendoza", "codigo": 17 },
      { "name": "Paula", "lastname": "Herrera", "codigo": 18 },
      { "name": "Sebastián", "lastname": "Rojas", "codigo": 19 },
      { "name": "Andrea", "lastname": "Vargas", "codigo": 20 }
    ]


  async executedSeed() {
    const count = await this.UserModel.countDocuments();
    if (count === 0 ) {
      const usersLower = this.usersPrueba.map(u => ({
      ...u,
      name: u.name.toLowerCase(),
      lastname: u.lastname.toLowerCase()
    }));
    const users = await this.UserModel.create(usersLower);
    return 'Seed Ejecutado';

    }else{
      return 'Existen usuarios en la tabla'
    }
  }

}
