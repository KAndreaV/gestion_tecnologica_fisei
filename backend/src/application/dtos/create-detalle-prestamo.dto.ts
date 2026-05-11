import { IsNumber, Min } from 'class-validator';

export class CreateDetallePrestamoDto {
  @IsNumber()
  idArt!: number;

  @IsNumber()
  @Min(1)
  canPre!: number;
}
