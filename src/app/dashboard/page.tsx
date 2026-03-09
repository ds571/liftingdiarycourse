import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getWorkoutsByDate } from "@/data/workouts";
import { DashboardClient } from "./dashboard-client";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/");
  }

  const { date: dateParam } = await searchParams;
  const date = dateParam ? new Date(dateParam) : new Date();

  const workouts = await getWorkoutsByDate(userId, date);

  const exercises = workouts.flatMap((w) =>
    w.exercises.map((e) => ({
      id: String(e.id),
      name: e.name,
      sets: e.sets.map((s) => ({
        reps: s.reps ?? 0,
        weight: Number(s.weight ?? 0),
      })),
    }))
  );

  const dateStr =
    dateParam ??
    `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

  return <DashboardClient date={dateStr} exercises={exercises} />;
}
