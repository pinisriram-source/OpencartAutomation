#!/usr/bin/env bash
# Retries `git push` against a moving main branch. The full-pipeline workflow
# commits and pushes multiple times over a long-running job, and other
# commits (manual pushes, concurrent workflow runs) can land on main in
# between -- a bare `git push` then gets rejected as non-fast-forward and
# aborts the whole job. Rebase onto the latest origin/main and retry instead.
set -e

for attempt in 1 2 3 4 5; do
  if git push; then
    exit 0
  fi
  echo "git push rejected (attempt ${attempt}/5) -- fetching and rebasing onto origin/main..."
  git fetch origin main --quiet
  if ! git rebase origin/main; then
    echo "git rebase hit a real conflict -- aborting rebase rather than leaving the repo mid-rebase."
    git rebase --abort
    exit 1
  fi
done

echo "git push failed after 5 attempts"
exit 1
