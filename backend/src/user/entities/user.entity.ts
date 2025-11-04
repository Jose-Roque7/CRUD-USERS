import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose"

@Schema()
export class User extends Document {
    
    @Prop()
    name: string;

    @Prop()
    lastname: string;

    @Prop({
        unique: true,
        index: true,
    })
    codigo: number;

}

export const userSchema = SchemaFactory.createForClass( User );