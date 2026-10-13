# test-02

Test repository for dependency and CVE scanning. It reproduces a real web UI repository: npm projects
built by Maven (`frontend-maven-plugin`) and published to Artifactory as `dist` tar.gz archives that
`test-03` unpacks into its WAR.

- root - AngularJS / jQuery / d3 application built with gulp. `package.json` and `package-lock.json`
  are identical to the real ones apart from the package name.
- `test-02-angular` - Angular 18 application built with the Angular CLI, same `package.json` and
  `package-lock.json` as the real one apart from the package name.

Version `25.4.10-SNAPSHOT`, deployed to the same Artifactory repositories as the real repository:

```
mvn clean deploy
```
