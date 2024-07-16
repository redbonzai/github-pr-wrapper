import { IsString, IsNotEmpty, IsInt } from 'class-validator';

export class MergePullRequestDto {
  @IsString()
  @IsNotEmpty()
  owner: string;

  @IsString()
  @IsNotEmpty()
  repo: string;
}
