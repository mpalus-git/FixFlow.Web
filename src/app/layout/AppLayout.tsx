import { MenuIcon } from "lucide-react";
import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Outlet, ScrollRestoration, useNavigation } from "react-router";
import { AppBrand } from "@/app/layout/AppBrand";
import { LanguageSwitcher } from "@/app/layout/LanguageSwitcher";
import { NavigationProgress } from "@/app/layout/NavigationProgress";
import { SidebarNav } from "@/app/layout/SidebarNav";
import { ThemeSwitcher } from "@/app/layout/ThemeSwitcher";
import { ServerWakeBanner } from "@/app/layout/ServerWakeBanner";
import { useFocusPageHeading } from "@/app/layout/useFocusPageHeading";
import { usePreloadNavigationPages } from "@/app/layout/usePreloadNavigationPages";
import { useRedirectOnSessionEnd } from "@/app/layout/useRedirectOnSessionEnd";
import { UserMenu } from "@/app/layout/UserMenu";
import { useCurrentUser } from "@/shared/session/currentUser";
import { Button } from "@/shared/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/shared/ui/sheet";

export function AppLayout() {
  const { t } = useTranslation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const isNavigatingFromMenu = useRef(false);
  const isPageLoading = useNavigation().state === "loading";
  useRedirectOnSessionEnd();
  useFocusPageHeading();
  usePreloadNavigationPages(useCurrentUser()?.role);

  return (
    <div className="flex min-h-svh">
      <ScrollRestoration />
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-md focus:bg-background focus:px-3 focus:py-2 focus:shadow-md"
      >
        {t("nav.skipToContent")}
      </a>
      <aside className="hidden w-60 shrink-0 flex-col gap-6 border-r bg-sidebar px-3 py-4 text-sidebar-foreground md:flex">
        <div className="px-3">
          <AppBrand />
        </div>
        <SidebarNav />
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-40 flex h-14 items-center gap-2 border-b bg-background/95 px-4 backdrop-blur">
          <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                aria-label={t("nav.openMenu")}
              >
                <MenuIcon aria-hidden="true" />
              </Button>
            </SheetTrigger>
            <SheetContent
              side="left"
              className="w-64 bg-sidebar px-3 py-4"
              onCloseAutoFocus={(event) => {
                if (isNavigatingFromMenu.current) {
                  isNavigatingFromMenu.current = false;
                  event.preventDefault();
                }
              }}
            >
              <SheetHeader className="px-3 py-0">
                <SheetTitle>
                  <AppBrand />
                </SheetTitle>
                <SheetDescription className="sr-only">{t("nav.label")}</SheetDescription>
              </SheetHeader>
              <SidebarNav
                onNavigate={() => {
                  isNavigatingFromMenu.current = true;
                  setIsMenuOpen(false);
                }}
              />
            </SheetContent>
          </Sheet>
          <div className="md:hidden">
            <AppBrand />
          </div>
          <div className="ml-auto flex items-center gap-1">
            <LanguageSwitcher />
            <ThemeSwitcher />
            <UserMenu />
          </div>
          <NavigationProgress />
        </header>
        <ServerWakeBanner />
        <main
          id="main-content"
          tabIndex={-1}
          aria-busy={isPageLoading}
          className="flex-1 p-4 outline-none md:p-6"
        >
          <div className="mx-auto w-full max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
