import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { NewWorkoutForm } from "./new-workout-form";

export default async function NewWorkoutPage() {
  const { userId } = await auth();
  if (!userId) redirect("/");

  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
      <div className="mb-6">
        <p className="text-sm text-muted-foreground">Create</p>
        <h1 className="text-3xl font-bold tracking-tight">New Workout</h1>
      </div>
      <NewWorkoutForm />
    </main>
  );
}
