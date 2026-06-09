import { IsNumber, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateNotificacionDto {
  @IsOptional()
  @IsNumber()
  idUsr?: number;

  @IsString()
  @MaxLength(1000)
  mensaje!: string;

  @IsString()
  @MaxLength(80)
  tipoNot!: string;
}
