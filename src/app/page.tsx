import { getSupabaseClient } from "@/lib/supabase";
import { addTestMessage } from "./actions";
import styles from "./page.module.css";

export default async function Home() {
  const supabase = getSupabaseClient();
  const { data: rows, error } = await supabase
    .from("connection_test")
    .select("id, message, created_at")
    .order("created_at", { ascending: false });

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <h1>Pipeline check: GitHub → Vercel → Supabase</h1>
        <p>
          This page is a Server Component that reads/writes the{" "}
          <code>connection_test</code> table in Supabase directly.
        </p>

        <form action={addTestMessage} style={{ display: "flex", gap: 8 }}>
          <input
            type="text"
            name="message"
            placeholder="Say something to save in Supabase"
            required
            style={{ flex: 1, padding: 8 }}
          />
          <button type="submit" style={{ padding: "8px 16px" }}>
            Save
          </button>
        </form>

        {error && <p style={{ color: "red" }}>Error: {error.message}</p>}

        <ul>
          {rows?.map((row) => (
            <li key={row.id}>
              {row.message} —{" "}
              <small>{new Date(row.created_at).toLocaleString()}</small>
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
}
