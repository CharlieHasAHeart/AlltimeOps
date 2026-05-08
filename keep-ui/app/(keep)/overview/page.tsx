import { Card, Subtitle, Title, Text, Button } from "@tremor/react";
import Link from "next/link";

const cards = [
  { title: "Monitored Servers", value: "0" },
  { title: "Active Incidents", value: "0" },
  { title: "Critical Signals", value: "0" },
  { title: "AI Diagnoses", value: "0" },
  { title: "Actions Executed", value: "0" },
];

export default function OverviewPage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <Title>Overview</Title>
        <Subtitle>
          No activity yet. Connect your first server or send a test signal to start
          monitoring.
        </Subtitle>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
        {cards.map((card) => (
          <Card key={card.title}>
            <Text>{card.title}</Text>
            <Title>{card.value}</Title>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <Card>
          <Title>Recent Incidents</Title>
          <Text className="mt-2">No active incidents.</Text>
        </Card>
        <Card>
          <Title>Recent Signals</Title>
          <Text className="mt-2">No signals detected.</Text>
        </Card>
      </div>

      <Card>
        <Title>Quick Actions</Title>
        <div className="mt-3 flex flex-wrap gap-2">
          <Button color="orange" variant="secondary" as={Link} href="/servers/add">
            Add Server
          </Button>
          <Button color="orange" variant="secondary" as={Link} href="/providers">
            Configure Provider
          </Button>
          <Button color="orange" variant="secondary" as={Link} href="/workflows">
            Create Playbook
          </Button>
        </div>
      </Card>
    </div>
  );
}
