"use client";

import { Subtitle } from "@tremor/react";
import { LinkWithIcon } from "components/LinkWithIcon";
import { Disclosure } from "@headlessui/react";
import { IoChevronUp } from "react-icons/io5";
import clsx from "clsx";
import { VscDebugDisconnect } from "react-icons/vsc";
import { RiSparkling2Line } from "react-icons/ri";
import { useConfig } from "@/utils/hooks/useConfig";
import { isMvpPageEnabled } from "./mvpVisibility";

export const SettingsLinks = () => {
  const { data: config } = useConfig();
  const showProviders = isMvpPageEnabled(config, "integrations");
  const showAiSettings = isMvpPageEnabled(config, "ai_settings");

  if (!showProviders && !showAiSettings) {
    return null;
  }

  return (
    <Disclosure as="div" className="space-y-0.5" defaultOpen>
      <Disclosure.Button className="w-full flex justify-between items-center px-2">
        {({ open }) => (
          <>
            <Subtitle className="text-xs ml-2 text-gray-900 font-medium uppercase">
              SETTINGS
            </Subtitle>
            <IoChevronUp
              className={clsx({ "rotate-180": open }, "mr-2 text-slate-400")}
            />
          </>
        )}
      </Disclosure.Button>

      <Disclosure.Panel as="ul" className="space-y-0.5 p-1 pr-1">
        {showProviders && (
          <li>
            <LinkWithIcon href="/providers" icon={VscDebugDisconnect}>
              <Subtitle className="text-xs">Integrations</Subtitle>
            </LinkWithIcon>
          </li>
        )}
        {showAiSettings && (
          <li>
            <LinkWithIcon href="/ai" icon={RiSparkling2Line}>
              <Subtitle className="text-xs">AI Settings</Subtitle>
            </LinkWithIcon>
          </li>
        )}
      </Disclosure.Panel>
    </Disclosure>
  );
};
