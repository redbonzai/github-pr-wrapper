import { IsString, IsNotEmpty } from 'class-validator';

export class OwnerRepoDto {
  @IsString()
  @IsNotEmpty()
  owner: string;

  @IsString()
  @IsNotEmpty()
  repo: string;
}
