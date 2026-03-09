import { auth } from "@clerk/nextjs/server";
import { redirect, notFound } from "next/navigation";
import { getWorkoutById } from "@/data/workouts";
import { EditWorkoutForm } from "./edit-workout-form";

export default async function EditWorkoutPage({
  params,
}: {
  params: Promise<{ workoutId: string }>;
}) {
  const { userId } = await auth();
  if (!userId) redirect("/");

  const { workoutId } = await params;
  const workout = await getWorkoutById(userId, Number(workoutId));
  if (!workout) notFound();

  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
      <div className="mb-6">
        <p className="text-sm text-muted-foreground">Edit</p>
        <h1 className="text-3xl font-bold tracking-tight">{workout.name}</h1>
      </div>
      <EditWorkoutForm workout={workout} />
    </main>
  );
}
