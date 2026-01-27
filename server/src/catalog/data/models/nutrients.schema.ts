import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ _id: false })
export class Nutrients {
  @Prop()
  calories?: number;

  @Prop()
  carbohydrates?: number;

  @Prop()
  protein?: number;

  @Prop()
  fats?: number;
}
export const NutrientsSchema = SchemaFactory.createForClass(Nutrients);
