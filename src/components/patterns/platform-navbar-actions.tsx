"use client";

import * as React from "react";

import { cn } from "../../lib/cn";
import { LanguageSwitcher, type LanguageSwitcherProps } from "../stable/language-switcher";
import { ThemeModeSwitch, type ThemeModeSwitchProps } from "../stable/theme-mode-switch";
import { AccountMenu, type AccountMenuProps } from "./account-menu";
import { NotificationMenu, type NotificationMenuProps } from "./notification-menu";

export type PlatformNavbarActionsProps = React.ComponentPropsWithoutRef<"div"> & {
  accountMenu?: AccountMenuProps;
  notificationMenu?: NotificationMenuProps;
  languageSwitcher?: LanguageSwitcherProps | boolean;
  themeModeSwitch?: ThemeModeSwitchProps | boolean;
};

export function PlatformNavbarActions({
  children,
  accountMenu,
  notificationMenu,
  languageSwitcher,
  themeModeSwitch,
  className,
  ...props
}: PlatformNavbarActionsProps) {
  return (
    <div
      data-slot="platform-navbar-actions"
      className={cn("flex shrink-0 items-center justify-end gap-2", className)}
      {...props}
    >
      {children}
      {languageSwitcher ? (
        <LanguageSwitcher {...(languageSwitcher === true ? {} : languageSwitcher)} />
      ) : null}
      {themeModeSwitch ? (
        <ThemeModeSwitch {...(themeModeSwitch === true ? {} : themeModeSwitch)} />
      ) : null}
      {notificationMenu ? <NotificationMenu {...notificationMenu} /> : null}
      {accountMenu ? <AccountMenu {...accountMenu} /> : null}
    </div>
  );
}
