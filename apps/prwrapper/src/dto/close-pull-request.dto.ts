import { IsString, IsNotEmpty } from 'class-validator';

export class ClosePullRequestDto {
  @IsString()
  @IsNotEmpty()
  owner: string;

  @IsString()
  @IsNotEmpty()
  repo: string;
}
