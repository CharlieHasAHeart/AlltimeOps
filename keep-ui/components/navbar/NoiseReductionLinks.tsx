"use client";

import { Subtitle } from "@tremor/react";
import { LinkWithIcon } from "components/LinkWithIcon";
import { Rules } from "components/icons";
import { Session } from "next-auth";
import { Disclosure } from "@headlessui/react";
import { IoChevronUp } from "react-icons/io5";
import { IoMdGitMerge } from "react-icons/io";
import clsx from "clsx";
import { useConfig } from "@/utils/hooks/useConfig";
import { useTenantConfiguration } from "@/utils/hooks/useTenantConfiguration";
import { ReactNode } from "react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { isMvpPageEnabled } from "./mvpVisibility";

type NoiseReductionLinksProps = { session: Session | null };

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

export const NoiseReductionLinks = ({ session }: NoiseReductionLinksProps) => {
  const isNOCRole = session?.userRole === "noc";
  const { data: envConfig } = useConfig();
  const safeEnvConfig = envConfig ?? undefined;
  const { data: tenantConfig } = useTenantConfiguration();
  const noiseReductionKeys = {
    HIDE_NAVBAR_DEDUPLICATION: "HIDE_NAVBAR_DEDUPLICATION",
    HIDE_NAVBAR_CORRELATION: "HIDE_NAVBAR_CORRELATION",
  };

  if (isNOCRole) {
    return null;
  }

  const showDeduplication = isMvpPageEnabled(safeEnvConfig, "deduplication");
  const showCorrelations = isMvpPageEnabled(safeEnvConfig, "correlations");
  const hasVisibleMvpItem = showDeduplication || showCorrelations;
  if (!hasVisibleMvpItem) {
    return null;
  }

  if (!Object.values(noiseReductionKeys).some((key) => !tenantConfig?.[key])) {
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
                  NOISE REDUCTION
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
        {showDeduplication && (
          <TogglableLink
            disabledConfigKey={noiseReductionKeys.HIDE_NAVBAR_DEDUPLICATION}
          >
            <li>
              <LinkWithIcon
                href="/deduplication"
                icon={IoMdGitMerge}
                testId="deduplication"
              >
                <Subtitle className="text-xs">Deduplication</Subtitle>
              </LinkWithIcon>
            </li>
          </TogglableLink>
        )}
        {showCorrelations && (
          <TogglableLink
            disabledConfigKey={noiseReductionKeys.HIDE_NAVBAR_CORRELATION}
          >
            <li>
              <LinkWithIcon href="/rules" icon={Rules} testId="rules">
                <Subtitle className="text-xs">Correlations</Subtitle>
              </LinkWithIcon>
            </li>
          </TogglableLink>
        )}
      </Disclosure.Panel>
    </Disclosure>
  );
};
