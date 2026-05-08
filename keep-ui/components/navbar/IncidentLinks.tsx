"use client";

import { Subtitle } from "@tremor/react";
import { LinkWithIcon } from "components/LinkWithIcon";
import { Session } from "next-auth";
import { Disclosure } from "@headlessui/react";
import { IoChevronUp } from "react-icons/io5";
import { useIncidents, usePollIncidents } from "utils/hooks/useIncidents";
import { MdFlashOn } from "react-icons/md";
import { RiHome6Line } from "react-icons/ri";
import { HiOutlineServerStack } from "react-icons/hi2";
import clsx from "clsx";
import {
  DEFAULT_INCIDENTS_PAGE_SIZE,
  DEFAULT_INCIDENTS_CEL,
  DEFAULT_INCIDENTS_SORTING,
} from "@/entities/incidents/model/models";
import { useConfig } from "@/utils/hooks/useConfig";
import { isMvpPageEnabled } from "./mvpVisibility";

type IncidentsLinksProps = { session: Session | null };

export const IncidentsLinks = ({ session }: IncidentsLinksProps) => {
  const { data: config } = useConfig();
  const isNOCRole = session?.userRole === "noc";
  const { data: incidents, mutate } = useIncidents(
    {
      candidate: false,
      predicted: null,
      limit: 0,
      offset: 0,
      sorting: DEFAULT_INCIDENTS_SORTING,
      cel: DEFAULT_INCIDENTS_CEL,
    },
    {}
  );
  usePollIncidents(mutate);

  const showOverview = isMvpPageEnabled(config, "overview");
  const showServers = isMvpPageEnabled(config, "servers");
  const showIncidents = isMvpPageEnabled(config, "incidents");

  if (isNOCRole || (!showOverview && !showServers && !showIncidents)) {
    return null;
  }

  return (
    <Disclosure as="div" className="space-y-0.5" defaultOpen>
      <Disclosure.Button className="w-full flex justify-between items-center px-2">
        {({ open }) => (
          <>
            <Subtitle className="text-xs ml-2 text-gray-900 font-medium uppercase">
              OPERATIONS
            </Subtitle>
            <IoChevronUp
              className={clsx({ "rotate-180": open }, "mr-2 text-slate-400")}
            />
          </>
        )}
      </Disclosure.Button>

      <Disclosure.Panel as="ul" className="space-y-0.5 p-1 pr-1">
        {showOverview && (
          <li className="relative">
            <LinkWithIcon href="/overview" icon={RiHome6Line} testId="overview">
              <Subtitle className="text-xs">Overview</Subtitle>
            </LinkWithIcon>
          </li>
        )}
        {showServers && (
          <li className="relative">
            <LinkWithIcon href="/servers" icon={HiOutlineServerStack} testId="servers">
              <Subtitle className="text-xs">Servers</Subtitle>
            </LinkWithIcon>
          </li>
        )}
        {showIncidents && (
          <li className="relative">
            <LinkWithIcon
              href="/incidents"
              icon={MdFlashOn}
              count={incidents?.count}
              testId="incidents"
            >
              <Subtitle className="text-xs">Incidents</Subtitle>
            </LinkWithIcon>
          </li>
        )}
      </Disclosure.Panel>
    </Disclosure>
  );
};
