type ProjectPageProps = {
  params: Promise<{ id: string }>;
};

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { id } = await params;

  return (
    <main style={{ padding: "1.5rem" }}>
      <h1>Project {id}</h1>
      <p>Project detail coming soon.</p>
    </main>
  );
}
