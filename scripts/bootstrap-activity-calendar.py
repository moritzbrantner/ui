#!/usr/bin/env python3

from pathlib import Path
import subprocess
import textwrap

WORKFLOW_PATH = ".github/workflows/activity-calendar-bootstrap.yml"
MARKER = "python3 <<'PY'\n"
END_MARKER = "\n          PY\n"

workflow = subprocess.check_output(
    ["git", "show", f"HEAD^:{WORKFLOW_PATH}"],
    text=True,
)
start = workflow.index(MARKER) + len(MARKER)
end = workflow.index(END_MARKER, start)
payload = textwrap.dedent(workflow[start:end])

exec(compile(payload, f"{WORKFLOW_PATH}:embedded-python", "exec"), {"__name__": "__main__"})
