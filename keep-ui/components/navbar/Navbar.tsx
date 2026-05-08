import { auth } from "@/auth";
import { Search } from "@/components/navbar/Search";
import { NoiseReductionLinks } from "@/components/navbar/NoiseReductionLinks";
import { AutomationLinks } from "@/components/navbar/AutomationLinks";
import { SettingsLinks } from "@/components/navbar/SettingsLinks";
import { AlertsLinks } from "@/components/navbar/AlertsLinks";
import { UserInfo } from "@/components/navbar/UserInfo";
import { Menu } from "@/components/navbar/Menu";
import { MinimizeMenuButton } from "@/components/navbar/MinimizeMenuButton";
import { IncidentsLinks } from "@/components/navbar/IncidentLinks";
import { SetSentryUser } from "./SetSentryUser";
import "./Navbar.css";

export default async function NavbarInner() {
  const session = await auth();

  return (
    <>
      <Menu session={session}>
        <Search session={session} />
        <div className="pt-4 space-y-4 flex-1 overflow-auto scrollable-menu-shadow">
          <IncidentsLinks session={session} />
          <AlertsLinks session={session} />
          <NoiseReductionLinks session={session} />
          <AutomationLinks session={session} />
          <SettingsLinks />
        </div>
        <UserInfo session={session} />
      </Menu>
      <MinimizeMenuButton />
      <SetSentryUser session={session} />
    </>
  );
}
