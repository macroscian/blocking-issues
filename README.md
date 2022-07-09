# Blocking Issues
A GitHub action to label issues when they're blocked by another issue.

**When triggered by a closed issue**: Checks for other PRs that were blocked by this issue and updates them

Add this file to `.github/workflows/blocking-issues.yml`:

```YAML
name: Blocking Issues

on:
  issues:
    types: [closed]
  workflow_dispatch:

jobs:
  blocking_issues:
    runs-on: ubuntu-latest
    name: Checks for blocking issues
    steps:
      - uses: macroscian/blocking-issues@v2
```

