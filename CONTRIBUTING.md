# Contributing to Makabasla v2

Thank you for contributing to **Makabasla v2**! This document outlines the commit conventions and pull request guidelines to keep our codebase clean and our history readable.

---

## Table of Contents

- [Branch Naming](#branch-naming)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Guidelines](#pull-request-guidelines)
- [Code Review](#code-review)

---

## Branch Naming

Create branches off `dev` using the following pattern:

```
<type>/<short-description>
```

| Type       | Purpose                          | Example                           |
| ---------- | -------------------------------- | --------------------------------- |
| `feature`  | New feature or enhancement       | `feature/patient-registration`    |
| `fix`      | Bug fix                          | `fix/appointment-null-pointer`    |
| `hotfix`   | Urgent production fix            | `hotfix/billing-crash`            |
| `refactor` | Code restructuring (no new feat) | `refactor/iam-service-cleanup`    |
| `docs`     | Documentation only               | `docs/update-api-readme`          |
| `chore`    | Tooling, CI/CD, dependencies     | `chore/upgrade-spring-boot`       |
| `test`     | Adding or updating tests         | `test/webstore-integration-tests` |

---

## Commit Guidelines

We follow the **[Conventional Commits](https://www.conventionalcommits.org/)** specification.

### Format

```
<type>(<scope>): <subject>

[optional body]

[optional footer(s)]
```

### Type

| Type       | Description                                        |
| ---------- | -------------------------------------------------- |
| `feat`     | A new feature                                      |
| `fix`      | A bug fix                                          |
| `docs`     | Documentation changes only                         |
| `style`    | Code style (formatting, semicolons — no logic)     |
| `refactor` | Code change that neither fixes a bug nor adds feat |
| `perf`     | Performance improvement                            |
| `test`     | Adding or correcting tests                         |
| `build`    | Build system or external dependency changes        |
| `ci`       | CI configuration and scripts                       |
| `chore`    | Other changes that don't modify src or test files  |
| `revert`   | Reverts a previous commit                          |

### Scope

Use the **service or module name** to indicate what area of the codebase is affected:

`api-gateway` · `iam-service` · `appointment-service` · `billing-service` · `task-mgt-service` · `webstore-service` · `frontend`

### Subject Rules

- Use the **imperative mood** ("add", not "added" or "adds")
- **Do not** capitalize the first letter
- **No period** at the end
- Keep it under **72 characters**

### Examples

```
feat(iam-service): add JWT refresh token rotation
```

```
fix(billing-service): handle null invoice on payment retry
```

```
docs(api-gateway): update route configuration README
```

```
refactor(appointment-service): extract validation into shared util

Moved input validation logic to a shared utility class to reduce
duplication across appointment and task management services.

Refs: #42
```

### Breaking Changes

Append `!` after the type/scope and add a `BREAKING CHANGE` footer:

```
feat(iam-service)!: switch auth from session to JWT

BREAKING CHANGE: All clients must now send a Bearer token in the
Authorization header. Session-based authentication is no longer supported.
```

---

## Pull Request Guidelines

### Before Opening a PR

1. **Rebase** your branch onto the latest `dev`:
   ```bash
   git fetch origin
   git rebase origin/dev
   ```
2. **Squash** WIP/fixup commits into meaningful, atomic commits.
3. **Run tests** locally and make sure they pass.
4. **Lint & format** your code (no trailing whitespace, consistent style).

### PR Title

Use the same Conventional Commits format as your commits:

```
feat(iam-service): add JWT refresh token rotation
```

### PR Description Template

```markdown
## What

Brief description of what this PR does.

## Why

Context on why this change is needed (link to issue if applicable).

## How

High-level summary of the approach.

## Checklist

- [ ] Code compiles without errors
- [ ] Tests added / updated
- [ ] Documentation updated (if applicable)
- [ ] No unrelated changes included
- [ ] Self-reviewed the diff
```

### PR Rules

| Rule               | Detail                                                           |
| ------------------ | ---------------------------------------------------------------- |
| **Size**           | Keep PRs small and focused — ideally **< 400 lines** changed.    |
| **Single concern** | One PR = one logical change. Don't mix features with refactors.  |
| **Draft PRs**      | Open as **Draft** if the work is still in progress.              |
| **Linked issues**  | Reference related issues with `Closes #123` or `Refs #123`.      |
| **Labels**         | Add relevant labels (e.g., `bug`, `feature`, `breaking-change`). |
| **Target branch**  | Always target `dev` unless it's a hotfix going to `main`.        |

---

## Code Review

### For Authors

- Respond to all review comments, even if just to acknowledge.
- Request a re-review after pushing changes.

### For Reviewers

- Be constructive and specific — suggest alternatives, not just problems.
- Approve only when you're confident the change is correct and complete.
- Use GitHub's suggestion feature for small fixes.

### Merge Strategy

- **Squash and merge** for feature/fix branches into `dev`.
- **Merge commit** for `dev` into `main` (preserves history).
- Delete the source branch after merge.

---

> **Questions?** Open a discussion or reach out to the maintainers. Happy contributing! 🚀
