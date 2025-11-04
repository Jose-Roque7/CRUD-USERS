import { InjectModel } from '@nestjs/mongoose';
import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException, } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { isValidObjectId, Model } from 'mongoose';
import { User } from './entities/user.entity';
import { PaginationDto } from 'src/common/dto/pagination.dto';


@Injectable()
export class UserService {
    
    constructor(
      @InjectModel( User.name)
      private readonly UserModel : Model<User>    
    ){}

   async create(createUserDto: CreateUserDto) {
    createUserDto.name = createUserDto.name.toLocaleLowerCase()
    createUserDto.lastname = createUserDto.lastname.toLocaleLowerCase()
    try {
      const usuario = await this.UserModel.create(createUserDto)
      return {messege: 'Usuario creado con exito:', usuario}
    }catch(error){this.manejoDeError(error)}
    
  }

  findAll(paginationDto: PaginationDto) {
    const {limit = 0} = paginationDto
    return this.UserModel.find()
    .limit(limit)
    .sort( {codigo: 1})
  }

  deleteAll(){
    return this.UserModel.deleteMany()
  }

  async findOne(id: string) {
    let usuario: User | null = null;
    if (!isNaN(+id)) usuario = await this.UserModel.findOne({codigo: id})
    if (!usuario && isValidObjectId(id)) usuario = await this.UserModel.findById(id)
    if (!usuario) usuario = await this.UserModel.findOne({name: id.toLocaleLowerCase().trim()})
    if (!usuario) throw new NotFoundException(`Usuario (${id}), no existe`)

    return usuario
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    let usuario = await this.findOne(id);
    if (updateUserDto.name) updateUserDto.name = updateUserDto.name?.toLocaleLowerCase();
    if (updateUserDto.lastname) updateUserDto.lastname = updateUserDto.lastname?.toLocaleLowerCase() 
    try{
      await usuario.updateOne(updateUserDto)
      return {...usuario.toJSON(),...updateUserDto}
    }catch(error){this.manejoDeError(error)}
    
  }

  async remove(id: string) {
    const { deletedCount } = await this.UserModel.deleteOne({_id: id});
    if(deletedCount === 0) throw new BadRequestException(`Usuario con ID:${id}, no existe.`)
    return {messege:'Usuario eliminado correctamente:',id}
  }

  private manejoDeError(error: any){
    if (error.code === 11000) throw new BadRequestException(`Usuario Existe en la DB ${JSON.stringify( error.keyValue) }`)
       console.log(error);
      throw new InternalServerErrorException(`No se pudo crear Usuario, verificar el server logs.`);
  }

  async usersd(id: string[]){
    await this.UserModel.deleteMany({ _id: { $in: id } })
    return 'Usuarios Eliminados Correctamente.'
  }
}
