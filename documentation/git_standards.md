# Git Standards

**Standards Adopted:** July 09, 2025

---

## 1. Introduction

This document outlines the standards for using Git in this project, effective from the date above. The goal is to maintain a clean, understandable, and collaborative project history.

---

## 2. Commit Standards

### Frequency & Scope
- **Commit Often:** Make small, focused commits for each logical change.
- **One Purpose per Commit:** Each commit should address a single issue, feature, or fix.
- **Avoid Large, Unrelated Commits:** Don't bundle unrelated changes together.

### Commit Message Format
- **Structure:**
  ```
  <type>: <short summary>

  [Optional longer description]
  [Reference to issue or ticket if applicable]
  ```
- **Types:**
  - feat: New feature
  - fix: Bug fix
  - docs: Documentation change
  - style: Formatting, missing semi colons, etc.
  - refactor: Code change that neither fixes a bug nor adds a feature
  - test: Adding or updating tests
  - chore: Maintenance
- **Example:**
  ```
  feat: add sentiment analysis component

  Adds a new SentimentAnalysis component to the News page. Improves user insight into market mood.
  ```

### What to Avoid
- Vague messages (e.g., "update stuff", "fix bugs")
- Committing generated files or dependencies unless necessary
- Committing directly to main for large features (use branches)

---

## 3. Push Standards

- **Push After Logical Units:** Push after completing a feature, fix, or logical chunk of work.
- **Sync Before Push:** Always pull/rebase before pushing to avoid conflicts.
- **Branching:**
  - Use feature branches for new features: `feature/<short-description>`
  - Use fix branches for bug fixes: `fix/<short-description>`
- **Pull Requests:**
  - Use PRs for merging significant changes into main
  - Request review if possible (even self-review)

---

## 4. General Best Practices

- Write clear, descriptive commit messages
- Keep commit history linear (rebase before merging if needed)
- Delete merged branches
- Don't commit secrets or sensitive data
- Use `.gitignore` to avoid committing unnecessary files

---

## 5. References

- [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/)
- [GitHub Flow](https://docs.github.com/en/get-started/quickstart/github-flow)
- [Pro Git Book](https://git-scm.com/book/en/v2)
