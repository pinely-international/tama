import { useQuery } from "@tanstack/react-query";

async function fetchUsers() {
  const res = await fetch("/api/users");
  if (!res.ok) throw new Error("Failed to load users");
  return res.json() as Promise<Array<{ id: string; name: string }>>;
}

export function UsersPage() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["users"],
    queryFn: fetchUsers,
    staleTime: 30_000,
  });

  if (isLoading) return <div>Loading…</div>;
  if (error)
    return (
      <div>
        Failed. <button onClick={() => refetch()}>Retry</button>
      </div>
    );

  return (
    <ul>
      {data!.map((u) => (
        <li key={u.id}>{u.name}</li>
      ))}
    </ul>
  );
}