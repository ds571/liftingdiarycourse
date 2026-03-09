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

export async function getWorkoutById(userId: string, workoutId: number) {
  return db.query.workouts.findFirst({
    where: and(eq(workouts.id, workoutId), eq(workouts.userId, userId)),
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

type UpdateExerciseInput = {
  name: string;
  order: number;
  sets: { order: number; weight: string | null; reps: number | null }[];
};

export async function updateWorkout(
  userId: string,
  workoutId: number,
  name: string,
  exerciseInputs: UpdateExerciseInput[]
) {
  const [workout] = await db
    .update(workouts)
    .set({ name })
    .where(and(eq(workouts.id, workoutId), eq(workouts.userId, userId)))
    .returning();

  if (!workout) throw new Error("Workout not found");

  // Delete existing exercises (sets cascade)
  await db.delete(exercises).where(eq(exercises.workoutId, workoutId));

  // Re-insert exercises and sets
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
