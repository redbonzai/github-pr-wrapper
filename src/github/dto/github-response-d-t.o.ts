// pull-request.dto.ts
import { UserDTO } from './user.dto';
import { RepoDTO } from './repo.dto';
import { PRLinksDTO } from './pr-links.dto';

export class PullRequestDTO {
  url: string;
  id: number;
  node_id: string;
  html_url: string;
  diff_url: string;
  patch_url: string;
  issue_url: string;
  number: number;
  state: string;
  locked: boolean;
  title: string;
  user: UserDTO;
  body: string | null;
  created_at: string;
  updated_at: string;
  closed_at: string | null;
  merged_at: string | null;
  merge_commit_sha: string | null;
  assignee: UserDTO | null;
  assignees: UserDTO[];
  requested_reviewers: UserDTO[];
  requested_teams: string[];
  labels: string[];
  milestone: string | null;
  draft: boolean;
  commits_url: string;
  review_comments_url: string;
  review_comment_url: string;
  comments_url: string;
  statuses_url: string;
  head: {
    label: string;
    ref: string;
    sha: string;
    user: UserDTO;
    repo: RepoDTO;
  };
  base: {
    label: string;
    ref: string;
    sha: string;
    user: UserDTO;
    repo: RepoDTO;
  };
  _links: PRLinksDTO;
  author_association: string;
  auto_merge: string | null;
  active_lock_reason: string | null;
}

export class GithubResponseDTO {
  pullRequests: PullRequestDTO[];
}
