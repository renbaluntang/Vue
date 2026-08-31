<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-100 via-slate-50 to-slate-200 px-4 py-10">
    <div class="mx-auto max-w-3xl rounded-3xl border border-slate-200 bg-white p-8 shadow-card sm:p-10">
      <p class="m-0 text-xs font-semibold uppercase tracking-[0.12em] text-primary-dark">
        Welcome
      </p>
      <h1 class="mt-2 font-display text-4xl text-slate-900 sm:text-5xl">Choose a Panel</h1>
      <p class="mt-3 text-sm text-slate-600">
        Select where you want to go. Each button opens a dedicated page.
      </p>

      <div class="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <a
          :href="withBase('/teacher')"
          class="inline-flex items-center justify-center rounded-2xl bg-primary px-5 py-4 text-center text-sm font-semibold text-white transition hover:bg-primary-dark"
        >
          Teacher Panel
        </a>
        <a
          :href="withBase('/student')"
          class="inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-white px-5 py-4 text-center text-sm font-semibold text-slate-800 transition hover:bg-slate-50"
        >
          Student Panel
        </a>
        <a
          :href="withBase('/student-2')"
          class="inline-flex items-center justify-center rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-center text-sm font-semibold text-amber-900 transition hover:bg-amber-100"
        >
          Student Panel 2
        </a>
        <a
          :href="withBase('/student-3')"
          class="inline-flex items-center justify-center rounded-2xl border border-teal-200 bg-teal-50 px-5 py-4 text-center text-sm font-semibold text-teal-900 transition hover:bg-teal-100"
        >
          Student Panel 3
        </a>
        <a
          :href="withBase('/student-4')"
          class="inline-flex items-center justify-center rounded-2xl border border-primary/30 bg-primary/10 px-5 py-4 text-center text-sm font-semibold text-primary-dark transition hover:bg-primary/20"
        >
          Student Panel 4
        </a>
        <a
          :href="withBase('/social-conversation')"
          class="inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-white px-5 py-4 text-center text-sm font-semibold text-slate-800 transition hover:bg-slate-50"
        >
          Social Conversation
        </a>
        <a
          :href="withBase('/login-1')"
          class="inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-white px-5 py-4 text-center text-sm font-semibold text-slate-800 transition hover:bg-slate-50"
        >
          Login / Register V1
        </a>
        <a
          :href="withBase('/login')"
          class="inline-flex items-center justify-center rounded-2xl border border-amber-300 bg-amber-50 px-5 py-4 text-center text-sm font-semibold text-amber-950 transition hover:bg-amber-100"
        >
          Login / Register V2 (New)
        </a>
        <a
          :href="withBase('/student-portal')"
          class="inline-flex items-center justify-center rounded-2xl border border-indigo-300 bg-indigo-50 px-5 py-4 text-center text-sm font-semibold text-indigo-950 transition hover:bg-indigo-100"
        >
          ✨ New Student Portal ✨
        </a>
        <a
          :href="withBase('/student-portal-v2')"
          class="inline-flex items-center justify-center rounded-2xl border border-zinc-900 bg-zinc-900 px-5 py-4 text-center text-sm font-semibold text-white shadow-sm transition hover:bg-zinc-800"
        >
          ✨ Minimalist Student Portal (V2) ✨
        </a>
        <a
          :href="withBase('/points-purchase')"
          class="inline-flex items-center justify-center rounded-2xl border border-sky-300 bg-sky-50 px-5 py-4 text-center text-sm font-semibold text-sky-950 transition hover:bg-sky-100"
        >
          Points Purchase
        </a>
      </div>
    </div>
  </div>
</template>

<script setup>
// Links are written from the app root; withBase() re-points them at whatever
// path the build is deployed under (/ locally, /Vue/ on GitHub Pages).
const withBase = (path) => `${import.meta.env.BASE_URL}${path.replace(/^\//, "")}`;
</script>
