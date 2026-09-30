import { Outlet } from "react-router";
import { LanguageSwitcher } from "@/app/layout/LanguageSwitcher";
import { ThemeSwitcher } from "@/app/layout/ThemeSwitcher";

export function PublicLayout() {
  return (
    <div className="flex min-h-svh flex-col">
      <header className="flex justify-end gap-1 p-3">
        <LanguageSwitcher />
        <ThemeSwitcher />
      </header>
      <main className="flex flex-1 items-start justify-center px-4 pt-4 pb-12 sm:items-center sm:pt-0">
        <Outlet />
      </main>
    </div>
  );
}
