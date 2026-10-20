# Maintenance

## Pull requests and release

Run the commands in [testing](testing.md) before opening a PR. Report-content or rubric changes require a fresh AI review and a current accepted judgment artifact. CI validates recorded evidence without using model credentials.

The Pages workflow calls the complete verification workflow before building and deploying. Changes reach the live site after they are merged into `main` and all release jobs succeed.

## RalphWorks

Maintainers can add `ralphworks:run` to an open issue to start a checked implementation run. A successful run opens a draft PR and requests a model review. Other labels handle PRD sub-issues, dependency queues, PR feedback, and branch updates. Maintainers review the resulting PRs before merging; all PRs also run the repository's verification workflow.

See the [RalphWorks issue and PR workflow guide](https://github.com/OctopusGarage/ralphworks/blob/main/docs/ISSUE_WORKFLOWS.md) for setup, labels, and retry steps.
