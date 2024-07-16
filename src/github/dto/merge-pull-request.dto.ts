import { IsString, IsNotEmpty } from 'class-validator';

export class MergePullRequestDto {
  @IsString()
  @IsNotEmpty()
  owner: string;

  @IsString()
  @IsNotEmpty()
  repo: string;
}
