import { IsString, IsNotEmpty } from 'class-validator';

export class CreatePullRequestDto {
  @IsString()
  @IsNotEmpty()
  owner: string;

  @IsString()
  @IsNotEmpty()
  repo: string;

  @IsString()
  @IsNotEmpty()
  head: string;

  @IsString()
  @IsNotEmpty()
  base: string;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  body: string;
}
