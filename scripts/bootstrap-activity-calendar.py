#!/usr/bin/env python3

import subprocess

WORKFLOW_PATH = ".github/workflows/activity-calendar-bootstrap.yml"
SOURCE_COMMIT = "194d44cd0c3daccd22f4469624a344ad4095773e"
MARKER = "python3 <<'PY'\n"
END_MARKER = "\n          PY\n"

workflow = subprocess.check_output(
    ["git", "show", f"{SOURCE_COMMIT}:{WORKFLOW_PATH}"],
    text=True,
)
start = workflow.index(MARKER) + len(MARKER)
end = workflow.index(END_MARKER, start)
raw_payload = workflow[start:end]
payload = "\n".join(
    line[10:] if line.startswith("          ") else line
    for line in raw_payload.splitlines()
)

exec(compile(payload, f"{WORKFLOW_PATH}:embedded-python", "exec"), {"__name__": "__main__"})
