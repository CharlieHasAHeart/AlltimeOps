"use client";

import { Subtitle } from "@tremor/react";
import { LinkWithIcon } from "components/LinkWithIcon";
import { Workflows } from "components/icons";
import { Session } from "next-auth";
import { Disclosure } from "@headlessui/react";
import { IoChevronUp } from "react-icons/io5";
import clsx from "clsx";
import { AILink } from "./AILink";
import { useConfig } from "@/utils/hooks/useConfig";
import { useTenantConfiguration } from "@/utils/hooks/useTenantConfiguration";
import { ReactNode } from "react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { isMvpPageEnabled } from "./mvpVisibility";

type AutomationLinksProps = { session: Session | null };

type TogglableLinkProps = {
  disabledConfigKey: string;
  children: ReactNode;
};

const TogglableLink = ({ children, disabledConfigKey }: TogglableLinkProps) => {
  const { data: tenantConfig, isLoading } = useTenantConfiguration();
  const { data: envConfig } = useConfig();

  if (isLoading || !tenantConfig) {
    return (
      <div className="flex gap-2 items-center h-7 pl-3">
        <Skeleton className="min-h-5 min-w-5" />
        <Skeleton
          className="min-h-5 min-w-24"
          containerClassName="min-h-5 min-w-24"
        />
      </div>
    );
  }

  if (
    !tenantConfig?.[disabledConfigKey] &&
    !(envConfig as any)?.[disabledConfigKey]
  ) {
    return <>{children}</>;
  }
};

export const AutomationLinks = ({ session }: AutomationLinksProps) => {
  const isNOCRole = session?.userRole === "noc";
  const { data: envConfig } = useConfig();
  const { data: tenantConfig } = useTenantConfiguration();

  const keys = {
    HIDE_NAVBAR_WORKFLOWS: "HIDE_NAVBAR_WORKFLOWS",
    HIDE_NAVBAR_AI_PLUGINS: "HIDE_NAVBAR_AI_PLUGINS",
  };

  if (isNOCRole) {
    return null;
  }

  const safeEnvConfig = envConfig ?? undefined;
  const showWorkflows = isMvpPageEnabled(safeEnvConfig, "playbooks");
  const showAiPlugins = isMvpPageEnabled(safeEnvConfig, "actions");

  if (!showWorkflows && !showAiPlugins) {
    return null;
  }

  return (
    <Disclosure as="div" className="space-y-0.5" defaultOpen>
      <Disclosure.Button className="w-full flex justify-between items-center px-2">
        {({ open }) => (
          <>
            {tenantConfig && (
              <>
                <Subtitle className="text-xs ml-2 text-gray-900 font-medium uppercase">
                  AUTOMATION
                </Subtitle>
                <IoChevronUp
                  className={clsx(
                    { "rotate-180": open },
                    "mr-2 text-slate-400"
                  )}
                />
              </>
            )}
            {!tenantConfig && (
              <div className="flex items-center h-7 pl-2">
                <Skeleton className="min-h-5 min-w-36" />
              </div>
            )}
          </>
        )}
      </Disclosure.Button>

      <Disclosure.Panel as="ul" className="space-y-0.5 p-1 pr-1">
        {showWorkflows && (
          <TogglableLink disabledConfigKey={keys.HIDE_NAVBAR_WORKFLOWS}>
            <li>
              <LinkWithIcon href="/workflows" icon={Workflows} testId="playbooks">
                <Subtitle className="text-xs">Playbooks</Subtitle>
              </LinkWithIcon>
            </li>
          </TogglableLink>
        )}
        {showAiPlugins && (
          <TogglableLink disabledConfigKey={keys.HIDE_NAVBAR_AI_PLUGINS}>
            <li>
              <AILink textOverride="Actions" href="/actions" />
            </li>
          </TogglableLink>
        )}
      </Disclosure.Panel>
    </Disclosure>
  );
};
