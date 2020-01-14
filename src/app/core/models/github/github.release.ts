export interface GithubRelease {
  html_url: string;
  name: string;
  tag_name: string; // the unique identifier of release
  body: string; // description of release
}
