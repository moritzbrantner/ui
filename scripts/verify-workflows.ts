#!/usr/bin/env bun

import { existsSync, mkdtempSync, readFileSync, readdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

type Workflow = {
  name?: string;
  on?: {
    workflow_call?: WorkflowCall;
  };
  permissions?: Permissions;
  jobs?: Record<string, WorkflowJob>;
};

type WorkflowCall = {
  inputs?: Record<string, WorkflowCallInput>;
  secrets?: Record<string, WorkflowCallSecret>;
};

type WorkflowCallInput = {
  required?: boolean;
};

type WorkflowCallSecret = {
  required?: boolean;
};

type WorkflowJob = {
  uses?: string;
  with?: Record<string, unknown>;
  secrets?: Record<string, unknown> | "inherit";
  permissions?: Permissions;
  jobs?: never;
};

type Permissions = Record<string, string> | "read-all" | "write-all";

declare const Bun: {
  YAML: {
    parse(source: string): unknown;
  };
};

type ReusableWorkflowRef = {
  owner: string;
  repo: string;
  workflowPath: string;
  ref: string;
};

const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const workflowsDir = path.join(packageRoot, ".github", "workflows");
const allowedReusableRepositories = new Set(["moritzbrantner/reusable-workflows"]);
const knownPermissionScopes = [
  "actions",
  "attestations",
  "checks",
  "contents",
  "deployments",
  "discussions",
  "id-token",
  "issues",
  "models",
  "packages",
  "pages",
  "pull-requests",
  "repository-projects",
  "security-events",
  "statuses",
];
const permissionRank = new Map([
  ["none", 0],
  ["read", 1],
  ["write", 2],
]);
const errors: string[] = [];
const cloneRoots = new Map<string, string>();
const tempRoot = mkdtempSync(path.join(tmpdir(), "ui-workflows-"));

try {
  for (const workflowPath of listWorkflowFiles()) {
    verifyWorkflow(workflowPath);
  }
} finally {
  rmSync(tempRoot, { recursive: true, force: true });
}

if (errors.length > 0) {
  console.error("Workflow verification failed:");

  for (const error of errors) {
    console.error(`- ${error}`);
  }

  process.exit(1);
}

console.log("@moritzbrantner/ui workflows verified");

function verifyWorkflow(workflowPath: string) {
  const workflow = parseWorkflow(workflowPath);
  const jobs = workflow.jobs ?? {};
  const relativeWorkflowPath = path.relative(packageRoot, workflowPath);

  for (const [jobName, job] of Object.entries(jobs)) {
    if (!job.uses) {
      continue;
    }

    const reusableWorkflowRef = parseReusableWorkflowRef(job.uses);

    if (!reusableWorkflowRef) {
      continue;
    }

    const repositoryName = `${reusableWorkflowRef.owner}/${reusableWorkflowRef.repo}`;

    if (!allowedReusableRepositories.has(repositoryName)) {
      continue;
    }

    const remoteWorkflowPath = fetchReusableWorkflow(
      reusableWorkflowRef,
      relativeWorkflowPath,
      jobName,
    );

    if (!remoteWorkflowPath) {
      continue;
    }

    const remoteWorkflow = parseWorkflow(remoteWorkflowPath);
    verifyCallInputs(relativeWorkflowPath, jobName, job, remoteWorkflow);
    verifyCallSecrets(relativeWorkflowPath, jobName, job, remoteWorkflow);
    verifyCallPermissions(relativeWorkflowPath, workflow, jobName, job, remoteWorkflow);
  }
}

function verifyCallInputs(
  workflowPath: string,
  jobName: string,
  job: WorkflowJob,
  remoteWorkflow: Workflow,
) {
  const workflowCall = remoteWorkflow.on?.workflow_call;

  if (!workflowCall) {
    errors.push(`${workflowPath}:${jobName} references a workflow without workflow_call`);
    return;
  }

  const allowedInputs = new Set(Object.keys(workflowCall.inputs ?? {}));
  const providedInputs = Object.keys(job.with ?? {});
  const unknownInputs = providedInputs.filter((inputName) => !allowedInputs.has(inputName));

  for (const inputName of unknownInputs) {
    errors.push(`${workflowPath}:${jobName} passes unsupported input ${inputName}`);
  }

  for (const [inputName, input] of Object.entries(workflowCall.inputs ?? {})) {
    if (input.required === true && !Object.hasOwn(job.with ?? {}, inputName)) {
      errors.push(`${workflowPath}:${jobName} is missing required input ${inputName}`);
    }
  }
}

function verifyCallSecrets(
  workflowPath: string,
  jobName: string,
  job: WorkflowJob,
  remoteWorkflow: Workflow,
) {
  const workflowCall = remoteWorkflow.on?.workflow_call;

  if (!workflowCall || job.secrets === "inherit") {
    return;
  }

  const allowedSecrets = new Set(Object.keys(workflowCall.secrets ?? {}));
  const providedSecrets = Object.keys(job.secrets ?? {});
  const unknownSecrets = providedSecrets.filter((secretName) => !allowedSecrets.has(secretName));

  for (const secretName of unknownSecrets) {
    errors.push(`${workflowPath}:${jobName} passes unsupported secret ${secretName}`);
  }

  for (const [secretName, secret] of Object.entries(workflowCall.secrets ?? {})) {
    if (secret.required === true && !Object.hasOwn(job.secrets ?? {}, secretName)) {
      errors.push(`${workflowPath}:${jobName} is missing required secret ${secretName}`);
    }
  }
}

function verifyCallPermissions(
  workflowPath: string,
  workflow: Workflow,
  jobName: string,
  job: WorkflowJob,
  remoteWorkflow: Workflow,
) {
  const callerPermissions = job.permissions ?? workflow.permissions;

  if (!callerPermissions) {
    errors.push(
      `${workflowPath}:${jobName} calls a reusable workflow without explicit caller permissions`,
    );
    return;
  }

  for (const [remoteJobName, remoteJob] of Object.entries(remoteWorkflow.jobs ?? {})) {
    const requestedPermissions = remoteJob.permissions ?? remoteWorkflow.permissions;

    if (!requestedPermissions) {
      continue;
    }

    for (const scope of scopesForPermissionComparison(requestedPermissions)) {
      const callerLevel = permissionLevel(callerPermissions, scope);
      const requestedLevel = permissionLevel(requestedPermissions, scope);

      if (callerLevel < requestedLevel) {
        errors.push(
          `${workflowPath}:${jobName} grants ${scope}: ${levelName(callerLevel)}, but called job ${remoteJobName} requests ${scope}: ${levelName(requestedLevel)}`,
        );
      }
    }
  }
}

function parseWorkflow(workflowPath: string): Workflow {
  return Bun.YAML.parse(readFileSync(workflowPath, "utf8")) as Workflow;
}

function parseReusableWorkflowRef(uses: string): ReusableWorkflowRef | null {
  const match = uses.match(
    /^(?<owner>[^/\s]+)\/(?<repo>[^/\s]+)\/(?<workflowPath>\.github\/workflows\/[^@\s]+)@(?<ref>[^@\s]+)$/,
  );

  if (!match?.groups) {
    return null;
  }

  return {
    owner: match.groups.owner,
    repo: match.groups.repo,
    workflowPath: match.groups.workflowPath,
    ref: match.groups.ref,
  };
}

function fetchReusableWorkflow(
  reusableWorkflowRef: ReusableWorkflowRef,
  workflowPath: string,
  jobName: string,
): string | null {
  const cloneRoot = cloneReusableWorkflowRepository(reusableWorkflowRef, workflowPath, jobName);

  if (!cloneRoot) {
    return null;
  }

  const remoteWorkflowPath = path.join(cloneRoot, reusableWorkflowRef.workflowPath);

  if (!existsSync(remoteWorkflowPath)) {
    errors.push(
      `${workflowPath}:${jobName} references missing workflow ${reusableWorkflowRef.workflowPath}@${reusableWorkflowRef.ref}`,
    );
    return null;
  }

  return remoteWorkflowPath;
}

function cloneReusableWorkflowRepository(
  reusableWorkflowRef: ReusableWorkflowRef,
  workflowPath: string,
  jobName: string,
): string | null {
  const repositoryName = `${reusableWorkflowRef.owner}/${reusableWorkflowRef.repo}`;
  const cloneKey = `${repositoryName}@${reusableWorkflowRef.ref}`;
  const existingCloneRoot = cloneRoots.get(cloneKey);

  if (existingCloneRoot) {
    return existingCloneRoot;
  }

  const cloneRoot = path.join(tempRoot, cloneKey.replace(/[^a-zA-Z0-9._-]/g, "-"));
  const repositoryUrl = `https://github.com/${repositoryName}.git`;

  try {
    execFileSync(
      "git",
      [
        "clone",
        "--quiet",
        "--depth",
        "1",
        "--branch",
        reusableWorkflowRef.ref,
        repositoryUrl,
        cloneRoot,
      ],
      {
        stdio: "pipe",
      },
    );
  } catch (error) {
    const stderr = error instanceof Error && "stderr" in error ? String(error.stderr) : "";
    errors.push(
      `${workflowPath}:${jobName} cannot fetch ${repositoryName}@${reusableWorkflowRef.ref}${stderr ? `: ${stderr.trim()}` : ""}`,
    );
    return null;
  }

  cloneRoots.set(cloneKey, cloneRoot);
  return cloneRoot;
}

function permissionLevel(permissions: Permissions, scope: string): number {
  if (permissions === "write-all") {
    return permissionRank.get("write") ?? 2;
  }

  if (permissions === "read-all") {
    return permissionRank.get("read") ?? 1;
  }

  const level = permissions[scope] ?? "none";
  return permissionRank.get(level) ?? 0;
}

function levelName(rank: number): string {
  if (rank >= 2) {
    return "write";
  }

  if (rank >= 1) {
    return "read";
  }

  return "none";
}

function scopesForPermissionComparison(permissions: Permissions): string[] {
  if (permissions === "read-all" || permissions === "write-all") {
    return knownPermissionScopes;
  }

  return Object.keys(permissions);
}

function listWorkflowFiles(): string[] {
  return readdirSync(workflowsDir)
    .filter((entryName) => entryName.endsWith(".yml") || entryName.endsWith(".yaml"))
    .sort()
    .map((entryName) => path.join(workflowsDir, entryName));
}
