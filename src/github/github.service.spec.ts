import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { GithubService } from './github.service';
import { fetchData } from '@libs/services';
import { vi } from 'vitest';
import Joi from 'joi';
import { LoggerModule } from '@libs/logger';

vi.mock('../../libs/common/services/fetch.service');

describe('GithubService', () => {
  let service: GithubService;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let configService: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          validationSchema: Joi.object({
            TOKEN: Joi.string().required(),
            OWNER: Joi.string().required(),
            REPO: Joi.string().required(),
            COLLABORATOR: Joi.string().required(),
            NX_ACCESS_TOKEN: Joi.string().required(),
          }),
          load: [
            () => ({
              TOKEN: 'test-token',
              GITHUB_API_URL: 'https://api.github.com',
            }),
          ],
        }),
        LoggerModule,
      ],
      providers: [GithubService],
    })
      .overrideProvider(ConfigService)
      .useValue({
        get: vi.fn((key: string) => {
          switch (key) {
            case 'TOKEN':
              return 'test-token';
            case 'GITHUB_API_URL':
              return 'https://api.github.com';
            default:
              return null;
          }
        }),
      })
      .compile();

    service = module.get<GithubService>(GithubService);
    configService = module.get<ConfigService>(ConfigService);
    spyOn(ConfigService.prototype, 'get').and.returnValue(configService);
    // spyOn(GithubService, 'githubToken').and.returnValue('test-token');
  });

  it('should be defined', () => {
    spyOn(ConfigService.prototype, 'get').and.returnValue(configService);
    expect(service).toBeDefined();
  });

  it('should initialize githubToken and githubAPIUrl correctly', () => {
    expect(service['githubToken']).toBe('test-token');
    expect(service['githubAPIUrl']).toBe('https://api.github.com');
  });

  it('should create a pull request', async () => {
    const mockResponse = { data: { html_url: 'http://example.com/pr/1' } };
    vi.mocked(fetchData).mockResolvedValueOnce(mockResponse);

    const result = await service.createPullRequest(
      'test-owner',
      'test-repo',
      'feature-branch',
      'main',
      'Test PR',
      'This is a test PR',
    );

    expect(fetchData).toHaveBeenCalledWith(
      'https://api.github.com/repos/test-owner/test-repo/pulls',
      'POST',
      {
        Authorization: 'token test-token',
        Accept: 'application/vnd.github.v3+json',
      },
      {
        title: 'Test PR',
        head: 'feature-branch',
        base: 'main',
        body: 'This is a test PR',
      },
    );
    expect(result).toEqual(mockResponse);
  });

  it('should comment on a pull request', async () => {
    const mockResponse = { data: 'comment' };
    vi.mocked(fetchData).mockResolvedValueOnce(mockResponse);

    await service.commentOnPullRequest(
      'test-owner',
      'test-repo',
      1,
      'Nice work!',
      'test-user',
      'test-token',
    );

    expect(fetchData).toHaveBeenCalledWith(
      'https://api.github.com/repos/test-owner/test-repo/issues/1/comments',
      'POST',
      {
        Authorization: 'token test-token',
        Accept: 'application/vnd.github.v3+json',
      },
      { body: 'Nice work!', user: 'test-user' },
    );
  });

  it('should request changes on a pull request', async () => {
    const mockResponse = { data: 'changes requested' };
    vi.mocked(fetchData).mockResolvedValueOnce(mockResponse);

    await service.requestChangesOnPullRequest(
      'test-owner',
      'test-repo',
      1,
      'Please make these changes.',
      'test-user',
      'test-token',
    );

    expect(fetchData).toHaveBeenCalledWith(
      'https://api.github.com/repos/test-owner/test-repo/pulls/1/reviews',
      'POST',
      {
        Authorization: 'token test-token',
        Accept: 'application/vnd.github.v3+json',
      },
      { body: 'Please make these changes.', event: 'REQUEST_CHANGES', user: 'test-user' },
    );
  });

  it('should approve a pull request', async () => {
    const mockResponse = { data: 'approved' };
    vi.mocked(fetchData).mockResolvedValueOnce(mockResponse);

    await service.approvePullRequest('test-owner', 'test-repo', 1);

    expect(fetchData).toHaveBeenCalledWith(
      'https://api.github.com/repos/test-owner/test-repo/pulls/1/reviews',
      'POST',
      {
        Authorization: 'token test-token',
        Accept: 'application/vnd.github.v3+json',
      },
      { event: 'APPROVE' },
    );
  });

  it('should close a pull request', async () => {
    const mockResponse = { data: 'closed' };
    vi.mocked(fetchData).mockResolvedValueOnce(mockResponse);

    const result = await service.closePullRequest('test-owner', 'test-repo', 1);

    expect(fetchData).toHaveBeenCalledWith(
      'https://api.github.com/repos/test-owner/test-repo/pulls/1',
      'PATCH',
      {
        Authorization: 'token test-token',
        Accept: 'application/vnd.github.v3+json',
      },
      { state: 'closed' },
    );
    expect(result).toEqual(mockResponse);
  });

  it('should merge a pull request', async () => {
    const mockStatuses = [{ state: 'success', context: 'test' }];
    const mockResponse = { data: 'merged' };
    vi.mocked(fetchData)
      .mockResolvedValueOnce({ data: mockStatuses })
      .mockResolvedValueOnce(mockResponse);

    const result = await service.mergePullRequest('test-owner', 'test-repo', 1);

    expect(fetchData).toHaveBeenCalledWith(
      'https://api.github.com/repos/test-owner/test-repo/pulls/1/statuses',
      'GET',
      {
        Authorization: 'token test-token',
        Accept: 'application/vnd.github.v3+json',
      },
    );

    expect(fetchData).toHaveBeenCalledWith(
      'https://api.github.com/repos/test-owner/test-repo/pulls/1/merge',
      'PUT',
      {
        Authorization: 'token test-token',
        Accept: 'application/vnd.github.v3+json',
      },
      {
        commit_title: 'Merging PR #1',
        merge_method: 'merge',
      },
    );

    expect(result).toEqual(mockResponse);
  });

  it('should get all pull requests', async () => {
    const mockResponse = [
      {
        url: 'https://api.github.com/repos/redbonzai/nest-pr-wrapper/pulls/7',
        id: 1971873187,
        node_id: 'PR_kwDOMShu6851iGWj',
        html_url: 'https://github.com/redbonzai/nest-pr-wrapper/pull/7',
        diff_url: 'https://github.com/redbonzai/nest-pr-wrapper/pull/7.diff',
        patch_url: 'https://github.com/redbonzai/nest-pr-wrapper/pull/7.patch',
        issue_url: 'https://api.github.com/repos/redbonzai/nest-pr-wrapper/issues/7',
        number: 7,
        state: 'open',
        locked: false,
        title: 'Dockerize',
        user: {
          login: 'redbonzai',
          id: 327866,
          node_id: 'MDQ6VXNlcjMyNzg2Ng==',
          avatar_url: 'https://avatars.githubusercontent.com/u/327866?v=4',
          gravatar_id: '',
          url: 'https://api.github.com/users/redbonzai',
          html_url: 'https://github.com/redbonzai',
          followers_url: 'https://api.github.com/users/redbonzai/followers',
          following_url: 'https://api.github.com/users/redbonzai/following{/other_user}',
          gists_url: 'https://api.github.com/users/redbonzai/gists{/gist_id}',
          starred_url: 'https://api.github.com/users/redbonzai/starred{/owner}{/repo}',
          subscriptions_url: 'https://api.github.com/users/redbonzai/subscriptions',
          organizations_url: 'https://api.github.com/users/redbonzai/orgs',
          repos_url: 'https://api.github.com/users/redbonzai/repos',
          events_url: 'https://api.github.com/users/redbonzai/events{/privacy}',
          received_events_url: 'https://api.github.com/users/redbonzai/received_events',
          type: 'User',
          site_admin: false,
        },
        body: null,
        created_at: '2024-07-16T15:37:42Z',
        updated_at: '2024-07-26T06:05:16Z',
        closed_at: null,
        merged_at: null,
        merge_commit_sha: 'd7692c353cda53c166b59c97a62fadde399673d0',
        assignee: null,
        assignees: [],
        requested_reviewers: [],
        requested_teams: [],
        labels: [],
        milestone: null,
        draft: false,
        commits_url: 'https://api.github.com/repos/redbonzai/nest-pr-wrapper/pulls/7/commits',
        review_comments_url:
          'https://api.github.com/repos/redbonzai/nest-pr-wrapper/pulls/7/comments',
        review_comment_url:
          'https://api.github.com/repos/redbonzai/nest-pr-wrapper/pulls/comments{/number}',
        comments_url: 'https://api.github.com/repos/redbonzai/nest-pr-wrapper/issues/7/comments',
        statuses_url:
          'https://api.github.com/repos/redbonzai/nest-pr-wrapper/statuses/fefccbe51d829e04426c765bf93dfd2590e5796e',
        head: {
          label: 'redbonzai:dockerize',
          ref: 'dockerize',
          sha: 'fefccbe51d829e04426c765bf93dfd2590e5796e',
          user: {
            login: 'redbonzai',
            id: 327866,
            node_id: 'MDQ6VXNlcjMyNzg2Ng==',
            avatar_url: 'https://avatars.githubusercontent.com/u/327866?v=4',
            gravatar_id: '',
            url: 'https://api.github.com/users/redbonzai',
            html_url: 'https://github.com/redbonzai',
            followers_url: 'https://api.github.com/users/redbonzai/followers',
            following_url: 'https://api.github.com/users/redbonzai/following{/other_user}',
            gists_url: 'https://api.github.com/users/redbonzai/gists{/gist_id}',
            starred_url: 'https://api.github.com/users/redbonzai/starred{/owner}{/repo}',
            subscriptions_url: 'https://api.github.com/users/redbonzai/subscriptions',
            organizations_url: 'https://api.github.com/users/redbonzai/orgs',
            repos_url: 'https://api.github.com/users/redbonzai/repos',
            events_url: 'https://api.github.com/users/redbonzai/events{/privacy}',
            received_events_url: 'https://api.github.com/users/redbonzai/received_events',
            type: 'User',
            site_admin: false,
          },
          repo: {
            id: 824733419,
            node_id: 'R_kgDOMShu6w',
            name: 'nest-pr-wrapper',
            full_name: 'redbonzai/nest-pr-wrapper',
            private: false,
            owner: {
              login: 'redbonzai',
              id: 327866,
              node_id: 'MDQ6VXNlcjMyNzg2Ng==',
              avatar_url: 'https://avatars.githubusercontent.com/u/327866?v=4',
              gravatar_id: '',
              url: 'https://api.github.com/users/redbonzai',
              html_url: 'https://github.com/redbonzai',
              followers_url: 'https://api.github.com/users/redbonzai/followers',
              following_url: 'https://api.github.com/users/redbonzai/following{/other_user}',
              gists_url: 'https://api.github.com/users/redbonzai/gists{/gist_id}',
              starred_url: 'https://api.github.com/users/redbonzai/starred{/owner}{/repo}',
              subscriptions_url: 'https://api.github.com/users/redbonzai/subscriptions',
              organizations_url: 'https://api.github.com/users/redbonzai/orgs',
              repos_url: 'https://api.github.com/users/redbonzai/repos',
              events_url: 'https://api.github.com/users/redbonzai/events{/privacy}',
              received_events_url: 'https://api.github.com/users/redbonzai/received_events',
              type: 'User',
              site_admin: false,
            },
            html_url: 'https://github.com/redbonzai/nest-pr-wrapper',
            description: null,
            fork: false,
            url: 'https://api.github.com/repos/redbonzai/nest-pr-wrapper',
            forks_url: 'https://api.github.com/repos/redbonzai/nest-pr-wrapper/forks',
            keys_url: 'https://api.github.com/repos/redbonzai/nest-pr-wrapper/keys{/key_id}',
            collaborators_url:
              'https://api.github.com/repos/redbonzai/nest-pr-wrapper/collaborators{/collaborator}',
            teams_url: 'https://api.github.com/repos/redbonzai/nest-pr-wrapper/teams',
            hooks_url: 'https://api.github.com/repos/redbonzai/nest-pr-wrapper/hooks',
            issue_events_url:
              'https://api.github.com/repos/redbonzai/nest-pr-wrapper/issues/events{/number}',
            events_url: 'https://api.github.com/repos/redbonzai/nest-pr-wrapper/events',
            assignees_url:
              'https://api.github.com/repos/redbonzai/nest-pr-wrapper/assignees{/user}',
            branches_url:
              'https://api.github.com/repos/redbonzai/nest-pr-wrapper/branches{/branch}',
            tags_url: 'https://api.github.com/repos/redbonzai/nest-pr-wrapper/tags',
            blobs_url: 'https://api.github.com/repos/redbonzai/nest-pr-wrapper/git/blobs{/sha}',
            git_tags_url: 'https://api.github.com/repos/redbonzai/nest-pr-wrapper/git/tags{/sha}',
            git_refs_url: 'https://api.github.com/repos/redbonzai/nest-pr-wrapper/git/refs{/sha}',
            trees_url: 'https://api.github.com/repos/redbonzai/nest-pr-wrapper/git/trees{/sha}',
            statuses_url: 'https://api.github.com/repos/redbonzai/nest-pr-wrapper/statuses/{sha}',
            languages_url: 'https://api.github.com/repos/redbonzai/nest-pr-wrapper/languages',
            stargazers_url: 'https://api.github.com/repos/redbonzai/nest-pr-wrapper/stargazers',
            contributors_url: 'https://api.github.com/repos/redbonzai/nest-pr-wrapper/contributors',
            subscribers_url: 'https://api.github.com/repos/redbonzai/nest-pr-wrapper/subscribers',
            subscription_url: 'https://api.github.com/repos/redbonzai/nest-pr-wrapper/subscription',
            commits_url: 'https://api.github.com/repos/redbonzai/nest-pr-wrapper/commits{/sha}',
            git_commits_url:
              'https://api.github.com/repos/redbonzai/nest-pr-wrapper/git/commits{/sha}',
            comments_url:
              'https://api.github.com/repos/redbonzai/nest-pr-wrapper/comments{/number}',
            issue_comment_url:
              'https://api.github.com/repos/redbonzai/nest-pr-wrapper/issues/comments{/number}',
            contents_url: 'https://api.github.com/repos/redbonzai/nest-pr-wrapper/contents/{+path}',
            compare_url:
              'https://api.github.com/repos/redbonzai/nest-pr-wrapper/compare/{base}...{head}',
            merges_url: 'https://api.github.com/repos/redbonzai/nest-pr-wrapper/merges',
            archive_url:
              'https://api.github.com/repos/redbonzai/nest-pr-wrapper/{archive_format}{/ref}',
            downloads_url: 'https://api.github.com/repos/redbonzai/nest-pr-wrapper/downloads',
            issues_url: 'https://api.github.com/repos/redbonzai/nest-pr-wrapper/issues{/number}',
            pulls_url: 'https://api.github.com/repos/redbonzai/nest-pr-wrapper/pulls{/number}',
            milestones_url:
              'https://api.github.com/repos/redbonzai/nest-pr-wrapper/milestones{/number}',
            notifications_url:
              'https://api.github.com/repos/redbonzai/nest-pr-wrapper/notifications{?since,all,participating}',
            labels_url: 'https://api.github.com/repos/redbonzai/nest-pr-wrapper/labels{/name}',
            releases_url: 'https://api.github.com/repos/redbonzai/nest-pr-wrapper/releases{/id}',
            deployments_url: 'https://api.github.com/repos/redbonzai/nest-pr-wrapper/deployments',
            created_at: '2024-07-05T20:08:05Z',
            updated_at: '2024-07-16T08:49:17Z',
            pushed_at: '2024-07-16T16:40:32Z',
            git_url: 'git://github.com/redbonzai/nest-pr-wrapper.git',
            ssh_url: 'git@github.com:redbonzai/nest-pr-wrapper.git',
            clone_url: 'https://github.com/redbonzai/nest-pr-wrapper.git',
            svn_url: 'https://github.com/redbonzai/nest-pr-wrapper',
            homepage: null,
            size: 456,
            stargazers_count: 0,
            watchers_count: 0,
            language: 'TypeScript',
            has_issues: true,
            has_projects: true,
            has_downloads: true,
            has_wiki: true,
            has_pages: false,
            has_discussions: false,
            forks_count: 0,
            mirror_url: null,
            archived: false,
            disabled: false,
            open_issues_count: 1,
            license: null,
            allow_forking: true,
            is_template: false,
            web_commit_signoff_required: false,
            topics: [],
            visibility: 'public',
            forks: 0,
            open_issues: 1,
            watchers: 0,
            default_branch: 'main',
          },
        },
        base: {
          label: 'redbonzai:main',
          ref: 'main',
          sha: 'ba0cb5ba7e3acb72bb11bdfecb41d81ded911831',
          user: {
            login: 'redbonzai',
            id: 327866,
            node_id: 'MDQ6VXNlcjMyNzg2Ng==',
            avatar_url: 'https://avatars.githubusercontent.com/u/327866?v=4',
            gravatar_id: '',
            url: 'https://api.github.com/users/redbonzai',
            html_url: 'https://github.com/redbonzai',
            followers_url: 'https://api.github.com/users/redbonzai/followers',
            following_url: 'https://api.github.com/users/redbonzai/following{/other_user}',
            gists_url: 'https://api.github.com/users/redbonzai/gists{/gist_id}',
            starred_url: 'https://api.github.com/users/redbonzai/starred{/owner}{/repo}',
            subscriptions_url: 'https://api.github.com/users/redbonzai/subscriptions',
            organizations_url: 'https://api.github.com/users/redbonzai/orgs',
            repos_url: 'https://api.github.com/users/redbonzai/repos',
            events_url: 'https://api.github.com/users/redbonzai/events{/privacy}',
            received_events_url: 'https://api.github.com/users/redbonzai/received_events',
            type: 'User',
            site_admin: false,
          },
          repo: {
            id: 824733419,
            node_id: 'R_kgDOMShu6w',
            name: 'nest-pr-wrapper',
            full_name: 'redbonzai/nest-pr-wrapper',
            private: false,
            owner: {
              login: 'redbonzai',
              id: 327866,
              node_id: 'MDQ6VXNlcjMyNzg2Ng==',
              avatar_url: 'https://avatars.githubusercontent.com/u/327866?v=4',
              gravatar_id: '',
              url: 'https://api.github.com/users/redbonzai',
              html_url: 'https://github.com/redbonzai',
              followers_url: 'https://api.github.com/users/redbonzai/followers',
              following_url: 'https://api.github.com/users/redbonzai/following{/other_user}',
              gists_url: 'https://api.github.com/users/redbonzai/gists{/gist_id}',
              starred_url: 'https://api.github.com/users/redbonzai/starred{/owner}{/repo}',
              subscriptions_url: 'https://api.github.com/users/redbonzai/subscriptions',
              organizations_url: 'https://api.github.com/users/redbonzai/orgs',
              repos_url: 'https://api.github.com/users/redbonzai/repos',
              events_url: 'https://api.github.com/users/redbonzai/events{/privacy}',
              received_events_url: 'https://api.github.com/users/redbonzai/received_events',
              type: 'User',
              site_admin: false,
            },
            html_url: 'https://github.com/redbonzai/nest-pr-wrapper',
            description: null,
            fork: false,
            url: 'https://api.github.com/repos/redbonzai/nest-pr-wrapper',
            forks_url: 'https://api.github.com/repos/redbonzai/nest-pr-wrapper/forks',
            keys_url: 'https://api.github.com/repos/redbonzai/nest-pr-wrapper/keys{/key_id}',
            collaborators_url:
              'https://api.github.com/repos/redbonzai/nest-pr-wrapper/collaborators{/collaborator}',
            teams_url: 'https://api.github.com/repos/redbonzai/nest-pr-wrapper/teams',
            hooks_url: 'https://api.github.com/repos/redbonzai/nest-pr-wrapper/hooks',
            issue_events_url:
              'https://api.github.com/repos/redbonzai/nest-pr-wrapper/issues/events{/number}',
            events_url: 'https://api.github.com/repos/redbonzai/nest-pr-wrapper/events',
            assignees_url:
              'https://api.github.com/repos/redbonzai/nest-pr-wrapper/assignees{/user}',
            branches_url:
              'https://api.github.com/repos/redbonzai/nest-pr-wrapper/branches{/branch}',
            tags_url: 'https://api.github.com/repos/redbonzai/nest-pr-wrapper/tags',
            blobs_url: 'https://api.github.com/repos/redbonzai/nest-pr-wrapper/git/blobs{/sha}',
            git_tags_url: 'https://api.github.com/repos/redbonzai/nest-pr-wrapper/git/tags{/sha}',
            git_refs_url: 'https://api.github.com/repos/redbonzai/nest-pr-wrapper/git/refs{/sha}',
            trees_url: 'https://api.github.com/repos/redbonzai/nest-pr-wrapper/git/trees{/sha}',
            statuses_url: 'https://api.github.com/repos/redbonzai/nest-pr-wrapper/statuses/{sha}',
            languages_url: 'https://api.github.com/repos/redbonzai/nest-pr-wrapper/languages',
            stargazers_url: 'https://api.github.com/repos/redbonzai/nest-pr-wrapper/stargazers',
            contributors_url: 'https://api.github.com/repos/redbonzai/nest-pr-wrapper/contributors',
            subscribers_url: 'https://api.github.com/repos/redbonzai/nest-pr-wrapper/subscribers',
            subscription_url: 'https://api.github.com/repos/redbonzai/nest-pr-wrapper/subscription',
            commits_url: 'https://api.github.com/repos/redbonzai/nest-pr-wrapper/commits{/sha}',
            git_commits_url:
              'https://api.github.com/repos/redbonzai/nest-pr-wrapper/git/commits{/sha}',
            comments_url:
              'https://api.github.com/repos/redbonzai/nest-pr-wrapper/comments{/number}',
            issue_comment_url:
              'https://api.github.com/repos/redbonzai/nest-pr-wrapper/issues/comments{/number}',
            contents_url: 'https://api.github.com/repos/redbonzai/nest-pr-wrapper/contents/{+path}',
            compare_url:
              'https://api.github.com/repos/redbonzai/nest-pr-wrapper/compare/{base}...{head}',
            merges_url: 'https://api.github.com/repos/redbonzai/nest-pr-wrapper/merges',
            archive_url:
              'https://api.github.com/repos/redbonzai/nest-pr-wrapper/{archive_format}{/ref}',
            downloads_url: 'https://api.github.com/repos/redbonzai/nest-pr-wrapper/downloads',
            issues_url: 'https://api.github.com/repos/redbonzai/nest-pr-wrapper/issues{/number}',
            pulls_url: 'https://api.github.com/repos/redbonzai/nest-pr-wrapper/pulls{/number}',
            milestones_url:
              'https://api.github.com/repos/redbonzai/nest-pr-wrapper/milestones{/number}',
            notifications_url:
              'https://api.github.com/repos/redbonzai/nest-pr-wrapper/notifications{?since,all,participating}',
            labels_url: 'https://api.github.com/repos/redbonzai/nest-pr-wrapper/labels{/name}',
            releases_url: 'https://api.github.com/repos/redbonzai/nest-pr-wrapper/releases{/id}',
            deployments_url: 'https://api.github.com/repos/redbonzai/nest-pr-wrapper/deployments',
            created_at: '2024-07-05T20:08:05Z',
            updated_at: '2024-07-16T08:49:17Z',
            pushed_at: '2024-07-16T16:40:32Z',
            git_url: 'git://github.com/redbonzai/nest-pr-wrapper.git',
            ssh_url: 'git@github.com:redbonzai/nest-pr-wrapper.git',
            clone_url: 'https://github.com/redbonzai/nest-pr-wrapper.git',
            svn_url: 'https://github.com/redbonzai/nest-pr-wrapper',
            homepage: null,
            size: 456,
            stargazers_count: 0,
            watchers_count: 0,
            language: 'TypeScript',
            has_issues: true,
            has_projects: true,
            has_downloads: true,
            has_wiki: true,
            has_pages: false,
            has_discussions: false,
            forks_count: 0,
            mirror_url: null,
            archived: false,
            disabled: false,
            open_issues_count: 1,
            license: null,
            allow_forking: true,
            is_template: false,
            web_commit_signoff_required: false,
            topics: [],
            visibility: 'public',
            forks: 0,
            open_issues: 1,
            watchers: 0,
            default_branch: 'main',
          },
        },
        _links: {
          self: { href: 'https://api.github.com/repos/redbonzai/nest-pr-wrapper/pulls/7' },
          html: { href: 'https://github.com/redbonzai/nest-pr-wrapper/pull/7' },
          issue: { href: 'https://api.github.com/repos/redbonzai/nest-pr-wrapper/issues/7' },
          comments: {
            href: 'https://api.github.com/repos/redbonzai/nest-pr-wrapper/issues/7/comments',
          },
          review_comments: {
            href: 'https://api.github.com/repos/redbonzai/nest-pr-wrapper/pulls/7/comments',
          },
          review_comment: {
            href: 'https://api.github.com/repos/redbonzai/nest-pr-wrapper/pulls/comments{/number}',
          },
          commits: {
            href: 'https://api.github.com/repos/redbonzai/nest-pr-wrapper/pulls/7/commits',
          },
          statuses: {
            href: 'https://api.github.com/repos/redbonzai/nest-pr-wrapper/statuses/fefccbe51d829e04426c765bf93dfd2590e5796e',
          },
        },
        author_association: 'OWNER',
        auto_merge: null,
        active_lock_reason: null,
      },
    ];
    vi.mocked(fetchData).mockResolvedValueOnce(mockResponse);

    const result = await service.getPullRequests('test-owner', 'test-repo');

    expect(fetchData).toHaveBeenCalledWith(
      'https://api.github.com/repos/test-owner/test-repo/pulls',
      'GET',
      {
        Authorization: 'token test-token',
        Accept: 'application/vnd.github.v3+json',
      },
    );
    expect(result).toEqual({ pullRequests: mockResponse });
  });
});
