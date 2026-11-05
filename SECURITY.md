# Security policy

## Supported versions

| Version | Supported |
|---|---|
| 2.x | Yes |
| 1.x | No |

## Report a vulnerability

Do not open a public issue for a security problem. Use GitHub's private vulnerability reporting: open the **Security** tab of [coco-base/cocokits](https://github.com/coco-base/cocokits/security) and choose **Report a vulnerability**. If that is not available, open an issue that asks for a private contact and contains no details of the problem.

Include the package and version, what you did, what you expected, what happened, and a minimal reproduction if you have one.

You can expect an answer within 7 days. We confirm the problem, fix it in a patch release and credit you in the release notes unless you prefer not to be named. Please give us a reasonable time to release a fix before you disclose the problem.

## Scope

The published `@cocokits/*` packages: for example script injection through a rendered attribute or markup, an unsafe URL, a prototype-pollution path, or a supply-chain problem in the package manifests. Problems in an application that uses CocoKits belong to that application.
