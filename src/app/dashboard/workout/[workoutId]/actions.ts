"use server";

import { z } from "zod";
import { auth } from "@clerk/nextjs/server";
import { updateWorkout } from "@/data/workouts";

const setSchema = z.object({
  weight: z.string().optional(),
  reps: z.coerce.number().int().min(1).optional(),
});

const exerciseSchema = z.object({
  name: z.string().min(1, "Exercise name is required"),
  sets: z.array(setSchema).min(1, "At least one set is required"),
});

const updateWorkoutSchema = z.object({
  workoutId: z.number(),
  name: z.string().min(1, "Workout name is required").max(255),
  exercises: z
    .array(exerciseSchema)
    .min(1, "At least one exercise is required"),
});

export async function updateWorkoutAction(params: {
  workoutId: number;
  name: string;
  exercises: { name: string; sets: { weight?: string; reps?: number }[] }[];
}) {
  const validated = updateWorkoutSchema.parse(params);
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const exerciseInputs = validated.exercises.map((e, i) => ({
    name: e.name,
    order: i + 1,
    sets: e.sets.map((s, j) => ({
      order: j + 1,
      weight: s.weight || null,
      reps: s.reps ?? null,
    })),
  }));

  await updateWorkout(userId, validated.workoutId, validated.name, exerciseInputs);
}
