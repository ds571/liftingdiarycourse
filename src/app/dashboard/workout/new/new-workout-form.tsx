"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { PlusIcon, Trash2Icon, DumbbellIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createWorkoutAction } from "./actions";

type SetInput = { weight: string; reps: string };
type ExerciseInput = { name: string; sets: SetInput[] };

function emptySet(): SetInput {
  return { weight: "", reps: "" };
}

function emptyExercise(): ExerciseInput {
  return { name: "", sets: [emptySet()] };
}

export function NewWorkoutForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [name, setName] = useState("");
  const [exercises, setExercises] = useState<ExerciseInput[]>([
    emptyExercise(),
  ]);
  const [error, setError] = useState<string | null>(null);

  function updateExercise(index: number, updates: Partial<ExerciseInput>) {
    setExercises((prev) =>
      prev.map((e, i) => (i === index ? { ...e, ...updates } : e))
    );
  }

  function updateSet(
    exerciseIndex: number,
    setIndex: number,
    updates: Partial<SetInput>
  ) {
    setExercises((prev) =>
      prev.map((e, ei) =>
        ei === exerciseIndex
          ? {
              ...e,
              sets: e.sets.map((s, si) =>
                si === setIndex ? { ...s, ...updates } : s
              ),
            }
          : e
      )
    );
  }

  function addExercise() {
    setExercises((prev) => [...prev, emptyExercise()]);
  }

  function removeExercise(index: number) {
    setExercises((prev) => prev.filter((_, i) => i !== index));
  }

  function addSet(exerciseIndex: number) {
    setExercises((prev) =>
      prev.map((e, i) =>
        i === exerciseIndex ? { ...e, sets: [...e.sets, emptySet()] } : e
      )
    );
  }

  function removeSet(exerciseIndex: number, setIndex: number) {
    setExercises((prev) =>
      prev.map((e, i) =>
        i === exerciseIndex
          ? { ...e, sets: e.sets.filter((_, si) => si !== setIndex) }
          : e
      )
    );
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Workout name is required.");
      return;
    }

    if (exercises.length === 0) {
      setError("Add at least one exercise.");
      return;
    }

    for (const exercise of exercises) {
      if (!exercise.name.trim()) {
        setError("All exercises must have a name.");
        return;
      }
      if (exercise.sets.length === 0) {
        setError(`"${exercise.name}" needs at least one set.`);
        return;
      }
    }

    startTransition(async () => {
      try {
        await createWorkoutAction({
          name: name.trim(),
          exercises: exercises.map((ex) => ({
            name: ex.name.trim(),
            sets: ex.sets.map((s) => ({
              weight: s.weight || undefined,
              reps: s.reps ? Number(s.reps) : undefined,
            })),
          })),
        });
        router.push("/dashboard");
      } catch {
        setError("Failed to create workout. Please try again.");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      {error && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="flex flex-col gap-2">
        <Label htmlFor="workout-name">Workout Name</Label>
        <Input
          id="workout-name"
          placeholder="e.g. Morning Push Session"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      <div className="flex flex-col gap-4">
        {exercises.map((exercise, ei) => (
          <Card key={ei}>
            <CardHeader className="flex-row items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex size-8 items-center justify-center rounded-md bg-primary/10">
                  <DumbbellIcon className="size-4 text-primary" />
                </div>
                <CardTitle className="text-base">
                  Exercise {ei + 1}
                </CardTitle>
              </div>
              {exercises.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeExercise(ei)}
                >
                  <Trash2Icon className="size-4" />
                </Button>
              )}
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor={`exercise-name-${ei}`}>Exercise Name</Label>
                <Input
                  id={`exercise-name-${ei}`}
                  placeholder="e.g. Bench Press"
                  value={exercise.name}
                  onChange={(e) =>
                    updateExercise(ei, { name: e.target.value })
                  }
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label>Sets</Label>
                {exercise.sets.map((set, si) => (
                  <div key={si} className="flex items-center gap-2">
                    <span className="w-14 text-sm text-muted-foreground">
                      Set {si + 1}
                    </span>
                    <Input
                      type="number"
                      placeholder="Weight (kg)"
                      value={set.weight}
                      onChange={(e) =>
                        updateSet(ei, si, { weight: e.target.value })
                      }
                      className="flex-1"
                      min="0"
                      step="0.5"
                    />
                    <Input
                      type="number"
                      placeholder="Reps"
                      value={set.reps}
                      onChange={(e) =>
                        updateSet(ei, si, { reps: e.target.value })
                      }
                      className="flex-1"
                      min="0"
                    />
                    {exercise.sets.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeSet(ei, si)}
                      >
                        <Trash2Icon className="size-3.5" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => addSet(ei)}
                  className="self-start"
                >
                  <PlusIcon className="size-4" />
                  Add Set
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Button
        type="button"
        variant="outline"
        onClick={addExercise}
        className="w-full"
      >
        <PlusIcon className="size-4" />
        Add Exercise
      </Button>

      <div className="flex gap-3">
        <Button
          type="button"
          variant="outline"
          className="flex-1"
          onClick={() => router.push("/dashboard")}
        >
          Cancel
        </Button>
        <Button type="submit" className="flex-1" disabled={isPending}>
          {isPending ? "Creating..." : "Create Workout"}
        </Button>
      </div>
    </form>
  );
}
