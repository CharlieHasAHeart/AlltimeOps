import { Card, Subtitle, Title, Text } from "@tremor/react";

export default function ActionsPage() {
  return (
    <div className="p-6">
      <Card>
        <Title>Actions</Title>
        <Subtitle>
          Run and track automated operational actions from playbooks.
        </Subtitle>
        <Text className="mt-4">
          No actions executed yet. Trigger a playbook run to see action history.
        </Text>
      </Card>
    </div>
  );
}
