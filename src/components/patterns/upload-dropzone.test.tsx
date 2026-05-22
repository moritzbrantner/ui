import { fireEvent, render, screen } from "@testing-library/react";
import * as React from "react";
import { describe, expect, test, vi } from "vitest";

import {
  Dropzone,
  DropzoneContent,
  DropzoneDefaultIcon,
  DropzoneDescription,
  DropzoneIcon,
  DropzoneInput,
  DropzoneTitle,
  UploadQueue,
  type UploadQueueFile,
} from "../../index";

const files: UploadQueueFile[] = [
  { id: "one", name: "coverage.csv", status: "uploading", progress: 45 },
  { id: "two", name: "release-notes.md", status: "error", error: "Upload failed" },
];

describe("pattern upload and dropzone surfaces", () => {
  test("renders dropzone slots and forwards input change", () => {
    const onChange = vi.fn();

    render(
      <Dropzone htmlFor="upload" className="contract-dropzone">
        <DropzoneInput id="upload" onChange={onChange} />
        <DropzoneIcon>
          <DropzoneDefaultIcon />
        </DropzoneIcon>
        <DropzoneContent>
          <DropzoneTitle>Upload files</DropzoneTitle>
          <DropzoneDescription>Drop package evidence here.</DropzoneDescription>
        </DropzoneContent>
      </Dropzone>,
    );

    const input = screen.getByLabelText(/Upload files/);
    fireEvent.change(input, {
      target: {
        files: [new File(["coverage"], "coverage.csv", { type: "text/csv" })],
      },
    });

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(screen.getByText("Upload files").closest('[data-slot="dropzone"]')?.className).toContain(
      "contract-dropzone",
    );
    expect(document.querySelector('[data-slot="dropzone-icon"]')).toBeTruthy();
  });

  test("renders upload queue state and retry callbacks", () => {
    const onRetry = vi.fn();
    const onRemove = vi.fn();

    render(<UploadQueue items={files} onRetry={onRetry} onRemove={onRemove} />);

    expect(screen.getByText("coverage.csv")).toBeTruthy();
    expect(screen.getByText("release-notes.md")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Retry upload" }));
    fireEvent.click(screen.getAllByRole("button", { name: "Remove upload" })[0]);

    expect(onRetry).toHaveBeenCalledWith(expect.objectContaining({ id: "two" }));
    expect(onRemove).toHaveBeenCalledWith(expect.objectContaining({ id: "one" }));
  });
});
