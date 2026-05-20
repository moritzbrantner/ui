#!/usr/bin/env bash
set -u

repo_root="$(git rev-parse --show-toplevel 2>/dev/null || true)"

if [[ -z "${repo_root}" ]]; then
  echo "Not inside a Git repository."
  exit 1
fi

cd "${repo_root}"

echo "Repository hygiene report"
echo

echo "Branch:"
git status --short --branch
echo

if [[ -n "$(git status --porcelain)" ]]; then
  echo "Dirty status:"
  git status --short
else
  echo "Dirty status: clean"
fi
echo

untracked_files="$(git ls-files --others --exclude-standard)"
if [[ -n "${untracked_files}" ]]; then
  echo "Untracked files:"
  printf "%s\n" "${untracked_files}"
else
  echo "Untracked files: none"
fi
echo

upstream="$(git rev-parse --abbrev-ref --symbolic-full-name '@{upstream}' 2>/dev/null || true)"
if [[ -z "${upstream}" ]]; then
  echo "Upstream: missing for current branch"
else
  echo "Upstream: ${upstream}"
  read -r behind ahead < <(git rev-list --left-right --count "${upstream}...HEAD")
  echo "Ahead/behind: ahead ${ahead}, behind ${behind}"
fi
echo

tracked_generated="$(git ls-files node_modules dist coverage playwright-report test-results storybook-static .turbo .vite .cache .bun '*.tgz' '*.log' '*.tsbuildinfo')"
if [[ -n "${tracked_generated}" ]]; then
  echo "Tracked generated/local artifacts:"
  printf "%s\n" "${tracked_generated}"
else
  echo "Tracked generated/local artifacts: none"
fi
echo

local_only_patterns=(
  ".env"
  ".env.local"
  ".env.development"
  ".env.production"
  ".bun/"
  ".cache/"
  ".turbo/"
  ".vite/"
  "coverage/"
  "dist/"
  "node_modules/"
  "playwright-report/"
  "storybook-static/"
  "test-results/"
)

missing_ignores=()
for pattern in "${local_only_patterns[@]}"; do
  if ! git check-ignore -q "${pattern}"; then
    missing_ignores+=("${pattern}")
  fi
done

if (( ${#missing_ignores[@]} > 0 )); then
  echo "Local-only paths not ignored:"
  printf "%s\n" "${missing_ignores[@]}"
else
  echo "Local-only paths ignored: ok"
fi
