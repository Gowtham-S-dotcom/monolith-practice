import { IsString, IsOptional, MinLength } from 'class-validator';

export class CreateItemDto {
  @IsString()
  @MinLength(2)
  name: string;

  @IsString()
  @IsOptional()
  description?: string;
}
