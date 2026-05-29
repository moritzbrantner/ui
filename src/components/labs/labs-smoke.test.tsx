import { render, screen } from "@testing-library/react";
import * as React from "react";
import { beforeAll, describe, expect, test } from "vitest";

import {
  AnnotationCanvas,
  DocumentViewer,
  ImageCropper,
  ImageFilterEditor,
  Timeline,
  TimelineConnector,
  TimelineContent,
  TimelineDescription,
  TimelineIndicator,
  TimelineItem,
  TimelineTime,
  TimelineTitle,
  type AnnotationCanvasAnnotation,
  type DocumentViewerPageData,
} from "../../labs";
import {
  ProfileSummary,
  ProfileSummaryAvatar,
  ProfileSummaryContent,
  ProfileSummaryDescription,
  ProfileSummaryTitle,
} from "../../social";

beforeAll(() => {
  globalThis.ResizeObserver ??= class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  };

  Element.prototype.setPointerCapture ??= () => {};
  Element.prototype.releasePointerCapture ??= () => {};
});

const annotations: AnnotationCanvasAnnotation[] = [
  {
    id: "annotation",
    shape: "rectangle",
    label: "Primary object",
    points: [
      { x: 10, y: 10 },
      { x: 80, y: 80 },
    ],
  },
];

const pages: DocumentViewerPageData[] = [
  {
    id: "page-1",
    pageNumber: 1,
    width: 800,
    height: 1000,
    text: "Release evidence page",
  },
];

describe("labs smoke coverage", () => {
  test("renders annotation, document, cropper, and filter editor surfaces", () => {
    render(
      <div>
        <AnnotationCanvas annotations={annotations} width={320} height={180} />
        <DocumentViewer pages={pages} />
        <ImageCropper
          src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw=="
          alt="Crop target"
        />
        <ImageFilterEditor
          src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw=="
          alt="Filter target"
        />
      </div>,
    );

    expect(document.querySelector('[data-slot="annotation-canvas"]')).toBeTruthy();
    expect(screen.getByText("Page 1")).toBeTruthy();
    expect(screen.getByAltText("Crop target")).toBeTruthy();
    expect(screen.getByAltText("Filter target")).toBeTruthy();
  });

  test("renders timeline and profile summary", () => {
    render(
      <div>
        <Timeline>
          <TimelineItem>
            <TimelineIndicator />
            <TimelineConnector />
            <TimelineContent>
              <TimelineTitle>Coverage planned</TimelineTitle>
              <TimelineDescription>Release-blocking tiers selected.</TimelineDescription>
              <TimelineTime dateTime="2026-05-22">May 22</TimelineTime>
            </TimelineContent>
          </TimelineItem>
        </Timeline>
        <ProfileSummary>
          <ProfileSummaryAvatar name="Ada Lovelace" />
          <ProfileSummaryContent>
            <ProfileSummaryTitle>Ada Lovelace</ProfileSummaryTitle>
            <ProfileSummaryDescription>Design-system reviewer.</ProfileSummaryDescription>
          </ProfileSummaryContent>
        </ProfileSummary>
      </div>,
    );

    expect(screen.getByText("Coverage planned")).toBeTruthy();
    expect(screen.getByText("Ada Lovelace")).toBeTruthy();
  });
});
