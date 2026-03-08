"use client";

import { useState } from "react";
import { format } from "date-fns";
import {
  CalendarIcon,
  DumbbellIcon,
  WeightIcon,
  RepeatIcon,
  MoonIcon,
  SunIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// Placeholder data - will be replaced with real data fetching later
const MOCK_WORKOUTS = [
  {
    id: "1",
    name: "Bench Press",
    sets: [
      { reps: 8, weight: 80 },
      { reps: 8, weight: 80 },
      { reps: 6, weight: 85 },
    ],
  },
  {
    id: "2",
    name: "Squat",
    sets: [
      { reps: 5, weight: 120 },
      { reps: 5, weight: 120 },
      { reps: 5, weight: 120 },
    ],
  },
  {
    id: "3",
    name: "Deadlift",
    sets: [
      { reps: 5, weight: 140 },
      { reps: 3, weight: 160 },
      { reps: 1, weight: 180 },
    ],
  },
];

function toggleDarkMode() {
  document.documentElement.classList.toggle("dark");
}

export default function DashboardPage() {
  const [date, setDate] = useState<Date>(new Date());

  const totalSets = MOCK_WORKOUTS.reduce((acc, w) => acc + w.sets.length, 0);
  const totalVolume = MOCK_WORKOUTS.reduce(
    (acc, w) => acc + w.sets.reduce((s, set) => s + set.reps * set.weight, 0),
    0
  );

  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Workout log</p>
          <h1 className="text-3xl font-bold tracking-tight">
            {format(date, "do MMM yyyy")}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={toggleDarkMode}>
            <SunIcon className="size-4 rotate-0 scale-100 transition-transform dark:rotate-90 dark:scale-0" />
            <MoonIcon className="absolute size-4 rotate-90 scale-0 transition-transform dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle dark mode</span>
          </Button>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline">
                <CalendarIcon />
                Pick a date
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                mode="single"
                selected={date}
                onSelect={(day) => day && setDate(day)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Summary stats */}
      <div className="mb-6 grid grid-cols-3 gap-3">
        <Card>
          <CardContent className="flex flex-col items-center py-3">
            <DumbbellIcon className="mb-1 size-5 text-primary" />
            <p className="text-2xl font-bold">{MOCK_WORKOUTS.length}</p>
            <p className="text-xs text-muted-foreground">Exercises</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex flex-col items-center py-3">
            <RepeatIcon className="mb-1 size-5 text-primary" />
            <p className="text-2xl font-bold">{totalSets}</p>
            <p className="text-xs text-muted-foreground">Total Sets</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex flex-col items-center py-3">
            <WeightIcon className="mb-1 size-5 text-primary" />
            <p className="text-2xl font-bold">
              {totalVolume.toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground">Volume (kg)</p>
          </CardContent>
        </Card>
      </div>

      {/* Workout list */}
      <div className="flex flex-col gap-4">
        {MOCK_WORKOUTS.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center gap-2 py-12">
              <DumbbellIcon className="size-10 text-muted-foreground/50" />
              <p className="text-muted-foreground">
                No workouts logged for this date.
              </p>
            </CardContent>
          </Card>
        ) : (
          MOCK_WORKOUTS.map((workout) => (
            <Card key={workout.id}>
              <CardHeader className="flex-row items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex size-8 items-center justify-center rounded-md bg-primary/10">
                    <DumbbellIcon className="size-4 text-primary" />
                  </div>
                  <CardTitle>{workout.name}</CardTitle>
                </div>
                <Badge variant="secondary">
                  {workout.sets.length} sets
                </Badge>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-2">
                  {workout.sets.map((set, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between rounded-lg bg-muted/50 px-4 py-2.5 transition-colors hover:bg-muted"
                    >
                      <span className="text-sm font-medium text-muted-foreground">
                        Set {index + 1}
                      </span>
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1 text-sm">
                          <RepeatIcon className="size-3.5 text-muted-foreground" />
                          <span className="font-semibold">{set.reps}</span>
                          <span className="text-muted-foreground">reps</span>
                        </span>
                        <span className="text-muted-foreground/30">|</span>
                        <span className="flex items-center gap-1 text-sm">
                          <WeightIcon className="size-3.5 text-muted-foreground" />
                          <span className="font-semibold">{set.weight}</span>
                          <span className="text-muted-foreground">kg</span>
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </main>
  );
}
