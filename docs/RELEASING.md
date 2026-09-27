# Releasing the npm package

The `Release Please` workflow manages `@sustainablewebsites/verdant-design` in
`packages/verdant-design`. The private demo site is not released.

## One-time setup

1. In GitHub **Settings → Actions → General → Workflow permissions**, enable
   **Allow GitHub Actions to create and approve pull requests**.
2. To run CI automatically on generated release PRs, add a repository Actions
   secret named `RELEASE_PLEASE_TOKEN`: a fine-grained personal access token with
   access to this repository and **Contents**, **Issues**, and **Pull requests**
   read/write permissions. Without it, the workflow uses `GITHUB_TOKEN`, whose
   generated PRs do not trigger CI. Required PR checks may then block merging.
3. In the npm package's **Settings → Trusted Publisher**, configure GitHub Actions
   with user `ivanoats`, repository `verdant-wsg-demo`, and workflow filename
   `release-please.yml`. Leave the environment blank and enable direct
   `npm publish`. No npm token secret is needed. Trusted publishing requires
   npm 11.5.1+; the workflow uses Node 24 from `.nvmrc`.

See the [release-please action documentation](https://github.com/googleapis/release-please-action)
and [npm trusted publishing guide](https://docs.npmjs.com/trusted-publishers/).

## Release flow

Use Conventional Commit titles when squash-merging package changes: `fix:` for
patches, `feat:` for features, and `feat!:` or a `BREAKING CHANGE:` footer for
breaking changes. While the package is below 1.0, breaking changes bump the minor
version. Changes outside the package directory do not trigger a package release.

On pushes to `main`, release-please opens or updates a release PR containing the
package version, package changelog, root lockfile workspace version, and release
manifest. The manifest starts at the existing `0.1.0`; `bootstrap-sha` marks its
baseline so historical commits are not released again.

Review and merge that PR to create a GitHub release and a tag such as
`verdant-design-v0.2.0`. In the same workflow run, the publish job checks out that
tag, runs the build, budget checks, unit tests and browser tests, previews the npm
tarball, and publishes the workspace with provenance. The package ships source
files, so no generated demo files enter the tarball.

If verification or publication fails, fix the underlying setup issue and use
**Re-run failed jobs** on the original run to preserve its release outputs.
Starting a new workflow run will not republish an existing release. If npm already
accepted the version, do not retry publication: npm versions are immutable.
