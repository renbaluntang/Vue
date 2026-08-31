<script setup>
import { ref, computed } from "vue";
import Badge from "@/components/ui/badge.vue";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import Progress from "@/components/ui/progress.vue";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import AreaTrendChart from "@/components/ui/AreaTrendChart.vue";
import { INSTRUCTORS, isSameDay, isClassDone } from "./data.js";

const props = defineProps({
  schedule: { type: Array, required: true },
  now: { type: Object, required: true },
});

const trendRange = ref("week");

const todayLessons = computed(() => props.schedule.filter((entry) => isSameDay(entry.date, props.now)));
const completedToday = computed(
  () => todayLessons.value.filter((entry) => isClassDone(entry, props.now)).length
);
const upcomingToday = computed(() => todayLessons.value.length - completedToday.value);
const completionRate = computed(() =>
  todayLessons.value.length ? Math.round((completedToday.value / todayLessons.value.length) * 100) : 0
);
const avgDifficulty = computed(() =>
  todayLessons.value.length
    ? Math.round(
        todayLessons.value.reduce((sum, entry) => sum + entry.difficulty, 0) / todayLessons.value.length
      )
    : 0
);

const instructorRows = computed(() =>
  INSTRUCTORS.map((name) => {
    const lessons = props.schedule.filter((entry) => entry.instructorName === name);
    const completed = lessons.filter((entry) => isClassDone(entry, props.now)).length;
    const avgPoints = lessons.length
      ? (lessons.reduce((sum, entry) => sum + entry.points, 0) / lessons.length).toFixed(1)
      : "0.0";
    return {
      name,
      lessons: lessons.length,
      completed,
      avgPoints,
    };
  }).sort((left, right) => right.lessons - left.lessons)
);

const completionTrendData = computed(() => {
  if (trendRange.value === "month") {
    return Array.from({ length: 4 }, (_, index) => {
      const taken = 42 + Math.floor(Math.random() * 25);
      const cancelled = 5 + Math.floor(Math.random() * 10);
      return {
        label: `Week ${index + 1}`,
        taken,
        cancelled: Math.min(cancelled, taken - 1),
      };
    });
  }

  if (trendRange.value === "year") {
    return ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"].map(
      (month) => {
        const taken = 160 + Math.floor(Math.random() * 110);
        const cancelled = 20 + Math.floor(Math.random() * 30);
        return {
          label: month,
          taken,
          cancelled: Math.min(cancelled, taken - 1),
        };
      }
    );
  }

  return ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => {
    const taken = 5 + Math.floor(Math.random() * 11);
    const cancelled = Math.floor(Math.random() * 4);
    return {
      label: day,
      taken,
      cancelled: Math.min(cancelled, taken - 1),
    };
  });
});

const completionTrendConfig = {
  taken: {
    label: "Classes taken",
    color: "hsl(var(--chart-1))",
  },
  cancelled: {
    label: "Cancelled classes",
    color: "hsl(var(--chart-3))",
  },
};
</script>

<template>
  <section class="grid gap-4">
    <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <Card>
        <CardHeader className="pb-2">
          <CardDescription>Today Lessons</CardDescription>
          <CardTitle className="text-2xl">{{ todayLessons.length }}</CardTitle>
        </CardHeader>
        <CardContent>
          <Badge variant="secondary">{{ upcomingToday }} upcoming</Badge>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardDescription>Completed Today</CardDescription>
          <CardTitle className="text-2xl">{{ completedToday }}</CardTitle>
        </CardHeader>
        <CardContent>
          <Badge>{{ completionRate }}% completion</Badge>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardDescription>Average Difficulty</CardDescription>
          <CardTitle className="text-2xl">{{ avgDifficulty }}%</CardTitle>
        </CardHeader>
        <CardContent>
          <Progress :value="avgDifficulty" />
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardDescription>Schedule Window</CardDescription>
          <CardTitle className="text-2xl">{{ schedule.length }}</CardTitle>
        </CardHeader>
        <CardContent>
          <Badge variant="outline">8-day total classes</Badge>
        </CardContent>
      </Card>
    </div>

    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-3">
        <div>
          <CardTitle>Class Activity Trend</CardTitle>
          <CardDescription>Classes taken vs cancelled</CardDescription>
        </div>
        <select
          v-model="trendRange"
          class="h-9 rounded-md border border-input bg-background px-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/40"
          aria-label="Select class trend range"
        >
          <option value="week">1 week</option>
          <option value="month">1 month</option>
          <option value="year">1 year</option>
        </select>
      </CardHeader>
      <CardContent>
        <AreaTrendChart
          :data="completionTrendData"
          :config="completionTrendConfig"
          :series-order="['cancelled', 'taken']"
          class-name="h-56 w-full"
        />
      </CardContent>
    </Card>

    <Card>
      <CardHeader>
        <CardTitle>Instructor Performance</CardTitle>
        <CardDescription>Lesson volume and completion snapshots</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Instructor</TableHead>
              <TableHead>Total Lessons</TableHead>
              <TableHead>Completed</TableHead>
              <TableHead>Avg Points</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow v-for="row in instructorRows" :key="row.name">
              <TableCell className="font-medium">{{ row.name }}</TableCell>
              <TableCell>{{ row.lessons }}</TableCell>
              <TableCell>{{ row.completed }}</TableCell>
              <TableCell>{{ row.avgPoints }}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  </section>
</template>
