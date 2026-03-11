type TaskPageProps = {
  params: Promise<{ id: string }>;
};

export default async function TaskPage({ params }: TaskPageProps) {
  const { id } = await params;

  return (
    <main style={{ padding: "1.5rem" }}>
      <h1>Task {id}</h1>
      <p>Task detail coming soon.</p>
    </main>
  );
}
