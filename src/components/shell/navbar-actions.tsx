"use client";

import * as React from "react";

import { cn } from "../../lib/cn";
import { LanguageSwitcher, type LanguageSwitcherProps } from "../stable/language-switcher";
import { ThemeModeSwitch, type ThemeModeSwitchProps } from "../stable/theme-mode-switch";
import { AccountMenu, type AccountMenuProps } from "./account-menu";
import { NotificationMenu, type NotificationMenuProps } from "./notification-menu";

export type NavbarActionsProps = React.ComponentPropsWithoutRef<"div"> & {
  accountMenu?: AccountMenuProps;
  notificationMenu?: NotificationMenuProps;
  languageSwitcher?: LanguageSwitcherProps | boolean;
  themeModeSwitch?: ThemeModeSwitchProps | boolean;
  loginAction?: React.ReactNode;
};

export function NavbarActions({
  children,
  accountMenu,
  notificationMenu,
  languageSwitcher,
  themeModeSwitch,
  loginAction,
  className,
  ...props
}: NavbarActionsProps) {
  return (
    <div
      data-slot="navbar-actions"
      className={cn(
        "flex min-w-0 shrink-0 items-center justify-end gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden [&>button]:min-h-10 [&>button]:shrink-0",
        className,
      )}
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
      {loginAction}
    </div>
  );
}
