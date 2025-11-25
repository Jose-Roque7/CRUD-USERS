// login/schemas/login.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import * as bcrypt from 'bcryptjs';

export type LoginDocument = Login & Document & { 
  comparePassword(candidate: string): Promise<boolean> 
};

@Schema({ timestamps: true })
export class Login {
  @Prop({ required: true, unique: true, lowercase: true })
  email: string;

  @Prop({ required: true })
  password: string;
}

export const LoginSchema = SchemaFactory.createForClass(Login);

LoginSchema.pre<LoginDocument>('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

LoginSchema.methods.comparePassword = async function (candidate: string) {
  return bcrypt.compare(candidate, this.password);
};
