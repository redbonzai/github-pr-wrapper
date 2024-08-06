import { IsString, IsNotEmpty, IsInt } from 'class-validator';

export class ApprovePullRequestDto {
  @IsString()
  @IsNotEmpty()
  owner: string;

  @IsString()
  @IsNotEmpty()
  repo: string;

  @IsInt()
  @IsNotEmpty()
  prNumber: number;
}
