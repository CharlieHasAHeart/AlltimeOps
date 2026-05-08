import { Card, Subtitle, Title, Text } from "@tremor/react";

const steps = [
  "Step 1: Server Info",
  "Step 2: Monitoring Setup",
  "Step 3: Diagnosis Access",
  "Step 4: Finish",
];

export default function AddServerPage() {
  return (
    <div className="p-6">
      <Card>
        <Title>Add Server</Title>
        <Subtitle>
          Guided onboarding wizard (Sprint 1 placeholder). Full implementation in
          Sprint 2.
        </Subtitle>
        <div className="mt-5 space-y-2">
          {steps.map((step) => (
            <div key={step} className="rounded border border-gray-200 p-3">
              <Text>{step}</Text>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
