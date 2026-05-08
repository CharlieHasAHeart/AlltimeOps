import ProvidersPage from "./page.client";

export default async function Page(props: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const searchParams = await props.searchParams;
  return <ProvidersPage searchParams={searchParams} />;
}

export const metadata = {
  title: "KAS - Integrations",
  description: "Connect integrations to collect signals and automate operations.",
};
