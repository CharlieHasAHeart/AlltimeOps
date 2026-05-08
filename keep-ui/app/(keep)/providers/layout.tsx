"use client";
import { PropsWithChildren } from "react";
import { ProvidersFilterByLabel } from "./components/providers-filter-by-label";
import { ProvidersSearch } from "./components/providers-search";
import { FilerContextProvider } from "./filter-context";
import { ProvidersCategories } from "./components/providers-categories";
import { PageSubtitle, PageTitle } from "@/shared/ui";

export default function ProvidersLayout({ children }: PropsWithChildren) {
  return (
    <FilerContextProvider>
      <div className="flex flex-col gap-6">
        <header>
          <PageTitle>Integrations</PageTitle>
          <PageSubtitle>
            Connect tools to collect signals, run diagnostics, send
            notifications, and create tickets.
          </PageSubtitle>
        </header>
        <main>
          <div className="flex w-full flex-col items-center mb-4">
            <div className="flex w-full">
              <ProvidersSearch />
              <ProvidersFilterByLabel />
            </div>
            <ProvidersCategories />
          </div>
          <div className="flex flex-col">{children}</div>
        </main>
      </div>
    </FilerContextProvider>
  );
}
