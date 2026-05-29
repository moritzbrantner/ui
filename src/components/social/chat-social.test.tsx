import { fireEvent, render, screen } from "@testing-library/react";
import * as React from "react";
import { describe, expect, test, vi } from "vitest";

import { Button } from "../stable/button";
import {
  Chat,
  ChatBubble,
  ChatComposer,
  ChatComposerInput,
  ChatHeader,
  ChatMessage,
  ChatMessageAvatar,
  ChatMessageContent,
  ChatMessageMeta,
  ChatSendButton,
  ChatThread,
  ChatTitle,
  CommentButton,
  FollowButton,
  LikeButton,
  ShareButton,
  SocialActionGroup,
  SocialComment,
  SocialCommentActions,
  SocialCommentAvatar,
  SocialCommentContent,
  SocialCommentList,
  SocialCommentMeta,
  SocialCommentText,
  SocialComposer,
  SocialComposerActions,
  SocialComposerHeader,
  SocialComposerTextarea,
  SocialComposerToolbar,
  SocialPost,
  SocialPostAuthor,
  SocialPostAvatar,
  SocialPostBody,
  SocialPostFooter,
  SocialPostHeader,
  SocialPostMeta,
  SocialPostMetrics,
  SocialPostText,
  SocialPostTitle,
} from "../../social";

describe("social chat and feed surfaces", () => {
  test("renders chat and submits composer through local callback only", () => {
    const onSubmit = vi.fn((event: React.FormEvent<HTMLFormElement>) => event.preventDefault());

    render(
      <Chat className="contract-chat">
        <ChatHeader>
          <ChatTitle>Support thread</ChatTitle>
        </ChatHeader>
        <ChatThread>
          <ChatMessage>
            <ChatMessageAvatar>MB</ChatMessageAvatar>
            <ChatMessageContent>
              <ChatMessageMeta>Mira, 09:30</ChatMessageMeta>
              <ChatBubble>Ready for review.</ChatBubble>
            </ChatMessageContent>
          </ChatMessage>
        </ChatThread>
        <ChatComposer onSubmit={onSubmit}>
          <ChatComposerInput aria-label="Message" defaultValue="Ship it." />
          <ChatSendButton />
        </ChatComposer>
      </Chat>,
    );

    expect(screen.getByText("Support thread").closest('[data-slot="chat"]')?.className).toContain(
      "contract-chat",
    );
    expect(screen.getByRole("log")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Send message" }));
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  test("renders chat with aligned messages", () => {
    render(
      <Chat>
        <ChatHeader>
          <ChatTitle>Direct thread</ChatTitle>
        </ChatHeader>
        <ChatThread>
          <ChatMessage>
            <ChatMessageContent>
              <ChatMessageMeta>Mira</ChatMessageMeta>
              <ChatBubble>Looks ready.</ChatBubble>
            </ChatMessageContent>
          </ChatMessage>
          <ChatMessage align="end">
            <ChatMessageContent>
              <ChatMessageMeta>You</ChatMessageMeta>
              <ChatBubble>Publishing now.</ChatBubble>
            </ChatMessageContent>
          </ChatMessage>
        </ChatThread>
      </Chat>,
    );

    expect(screen.getByRole("log")).toBeTruthy();
    expect(
      screen
        .getByText("Publishing now.")
        .closest('[data-slot="chat-message"]')
        ?.getAttribute("data-align"),
    ).toBe("end");
  });

  test("renders social actions and fires button callbacks", () => {
    const onLike = vi.fn();
    const onShare = vi.fn();

    render(
      <SocialActionGroup>
        <LikeButton liked count={12} onClick={onLike} />
        <CommentButton count={4} />
        <ShareButton count={2} onClick={onShare} />
        <FollowButton following />
      </SocialActionGroup>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Unlike 12" }));
    fireEvent.click(screen.getByRole("button", { name: "Share 2" }));

    expect(onLike).toHaveBeenCalledTimes(1);
    expect(onShare).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("button", { name: "Following" }).getAttribute("aria-pressed")).toBe(
      "true",
    );
  });

  test("renders social feed, comments, and composer workflow", () => {
    const onSubmit = vi.fn((event: React.FormEvent<HTMLFormElement>) => event.preventDefault());

    render(
      <div>
        <SocialComposer onSubmit={onSubmit}>
          <SocialComposerHeader>Share an update</SocialComposerHeader>
          <SocialComposerTextarea aria-label="Post draft" defaultValue="Coverage updated." />
          <SocialComposerToolbar>
            <SocialComposerActions>
              <Button type="submit">Publish update</Button>
            </SocialComposerActions>
          </SocialComposerToolbar>
        </SocialComposer>
        <SocialPost featured>
          <SocialPostHeader>
            <SocialPostAvatar name="Ada Lovelace" />
            <SocialPostAuthor>
              <SocialPostTitle>Ada Lovelace</SocialPostTitle>
              <SocialPostMeta>Today</SocialPostMeta>
            </SocialPostAuthor>
          </SocialPostHeader>
          <SocialPostBody>
            <SocialPostText>Analytical engines now have replies.</SocialPostText>
          </SocialPostBody>
          <SocialPostFooter>
            <SocialPostMetrics>42 likes</SocialPostMetrics>
            <SocialCommentList aria-label="Recent comments">
              <SocialComment>
                <SocialCommentAvatar name="Grace Hopper" />
                <SocialCommentContent>
                  <SocialCommentMeta>Grace Hopper</SocialCommentMeta>
                  <SocialCommentText>Ready for review.</SocialCommentText>
                  <SocialCommentActions>
                    <Button type="button">Reply</Button>
                  </SocialCommentActions>
                </SocialCommentContent>
              </SocialComment>
            </SocialCommentList>
          </SocialPostFooter>
        </SocialPost>
      </div>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Publish update" }));

    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("article").getAttribute("data-featured")).toBe("true");
    expect(screen.getByRole("list", { name: "Recent comments" })).toBeTruthy();
    expect(screen.getByText("AL")).toBeTruthy();
  });
});
