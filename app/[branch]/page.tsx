import BranchPageClient from "./BrachPageClient";

export default async function MenuPage({
  params,
}: {
  params: { branch: string };
}) {
  const { branch } = params;

  return (
    <div className="p-6">
      <BranchPageClient branchSlug={branch} />
    </div>
  );
}
