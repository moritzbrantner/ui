import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";

import { AnnotationCanvas, type AnnotationCanvasAnnotation } from "./annotation-canvas";

const annotations: AnnotationCanvasAnnotation[] = [
  {
    id: "existing",
    shape: "point",
    points: [{ x: 20, y: 20 }],
    label: "Existing",
  },
];

describe("AnnotationCanvas", () => {
  test("supports aria labels and deterministic annotation ids", () => {
    const onAnnotationsChange = vi.fn();
    const onAnnotationCreate = vi.fn();

    render(
      <AnnotationCanvas
        annotations={[]}
        width={100}
        height={100}
        tool="point"
        ariaLabel="Review canvas"
        createAnnotationId={() => "fixed-id"}
        onAnnotationsChange={onAnnotationsChange}
        onAnnotationCreate={onAnnotationCreate}
      />,
    );

    fireEvent.pointerDown(screen.getByRole("img", { name: "Review canvas" }), {
      clientX: 10,
      clientY: 10,
    });

    expect(onAnnotationsChange).toHaveBeenCalledWith([
      expect.objectContaining({ id: "fixed-id", shape: "point" }),
    ]);
    expect(onAnnotationCreate).toHaveBeenCalledWith(
      expect.objectContaining({ id: "fixed-id", shape: "point" }),
    );
  });

  test("calls delete callbacks for selected annotations", () => {
    const onAnnotationsChange = vi.fn();
    const onAnnotationDelete = vi.fn();
    const { container } = render(
      <AnnotationCanvas
        annotations={annotations}
        width={100}
        height={100}
        selectedAnnotationId="existing"
        onAnnotationsChange={onAnnotationsChange}
        onAnnotationDelete={onAnnotationDelete}
      />,
    );

    fireEvent.keyDown(container.querySelector('[data-slot="annotation-canvas"]')!, {
      key: "Delete",
    });

    expect(onAnnotationDelete).toHaveBeenCalledWith(annotations[0]);
    expect(onAnnotationsChange).toHaveBeenCalledWith([]);
  });
});
