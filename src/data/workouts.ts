import { db } from "@/db";
import { workouts, exercises, sets } from "@/db/schema";
import { eq, and, gte, lt } from "drizzle-orm";

export async function getWorkoutsByDate(userId: string, date: Date) {
  const startOfDay = new Date(date);
  startOfDay.setUTCHours(0, 0, 0, 0);

  const endOfDay = new Date(date);
  endOfDay.setUTCHours(23, 59, 59, 999);

  return db.query.workouts.findMany({
    where: and(
      eq(workouts.userId, userId),
      gte(workouts.startedAt, startOfDay),
      lt(workouts.startedAt, endOfDay)
    ),
    with: {
      exercises: {
        with: {
          sets: true,
        },
        orderBy: (exercises, { asc }) => [asc(exercises.order)],
      },
    },
  });
}

type CreateExerciseInput = {
  name: string;
  order: number;
  sets: { order: number; weight: string | null; reps: number | null }[];
};

export async function createWorkout(
  userId: string,
  name: string,
  exerciseInputs: CreateExerciseInput[]
) {
  const [workout] = await db
    .insert(workouts)
    .values({ userId, name, startedAt: new Date() })
    .returning();

  for (const exercise of exerciseInputs) {
    const [insertedExercise] = await db
      .insert(exercises)
      .values({
        workoutId: workout.id,
        name: exercise.name,
        order: exercise.order,
      })
      .returning();

    if (exercise.sets.length > 0) {
      await db.insert(sets).values(
        exercise.sets.map((s) => ({
          exerciseId: insertedExercise.id,
          order: s.order,
          weight: s.weight,
          reps: s.reps,
        }))
      );
    }
  }

  return workout;
}
