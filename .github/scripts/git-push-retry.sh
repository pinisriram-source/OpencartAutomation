#!/usr/bin/env bash
# Retries `git push` against a moving main branch. The full-pipeline workflow
# commits and pushes multiple times over a long-running job, and other
# commits (manual pushes, concurrent workflow runs) can land on main in
# between -- a bare `git push` then gets rejected as non-fast-forward and
# aborts the whole job. Merge in the latest origin/main and retry instead.
#
# Merge, not rebase: rebase demands a perfectly clean working tree and is
# less forgiving of a CI checkout's incidental state (e.g. actions/checkout
# can leave HEAD detached, which plain rebase+push handles poorly). This is
# a bot-only commit history, so a merge commit here is a non-issue -- and it
# only ever touches the small set of files this step itself just staged.
set -e

for attempt in 1 2 3 4 5; do
  if git push; then
    exit 0
  fi
  echo "git push rejected (attempt ${attempt}/5) -- fetching and merging origin/main..."
  git fetch origin main --quiet
  if ! git merge origin/main --no-edit; then
    echo "git merge hit a real conflict -- aborting merge rather than leaving the repo mid-merge."
    git merge --abort
    exit 1
  fi
done

echo "git push failed after 5 attempts"
exit 1
