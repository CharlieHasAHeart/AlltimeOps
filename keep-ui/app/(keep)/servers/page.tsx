import { Card, Subtitle, Title, Text, Button } from "@tremor/react";
import Link from "next/link";

export default function ServersPage() {
  return (
    <div className="p-6">
      <Card>
        <div className="flex items-center justify-between">
          <div>
            <Title>Servers</Title>
            <Subtitle>
              No servers connected yet. Connect your first server to start
              monitoring infrastructure and services.
            </Subtitle>
          </div>
          <Button color="orange" as={Link} href="/servers/add">
            Add Server
          </Button>
        </div>
        <Text className="mt-6">No servers connected.</Text>
      </Card>
    </div>
  );
}
