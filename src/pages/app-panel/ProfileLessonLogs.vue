<script setup>
defineProps({
  entry: { type: Object, required: true },
});
</script>

<template>
  <div class="space-y-3 rounded-xl bg-slate-50 p-4 text-sm text-slate-700">
    <p class="m-0 font-semibold text-slate-800">Lesson Logs</p>
    <div class="overflow-x-auto rounded border border-slate-200 bg-white">
      <table class="min-w-full border-collapse text-xs sm:text-sm">
        <thead class="bg-slate-100 text-slate-600">
          <tr>
            <th class="border-b border-slate-200 px-3 py-2 text-left">Date</th>
            <th class="border-b border-slate-200 px-3 py-2 text-left">Subject</th>
            <th class="border-b border-slate-200 px-3 py-2 text-left">Feedback</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td class="border-b border-slate-100 px-3 py-2">02/11/2026</td>
            <td class="border-b border-slate-100 px-3 py-2">{{ entry.subject }}</td>
            <td class="border-b border-slate-100 px-3 py-2">
              Improved fluency and sentence pacing.
            </td>
          </tr>
          <tr>
            <td class="px-3 py-2">01/18/2026</td>
            <td class="px-3 py-2">[PP201] Pronunciation - Consonants</td>
            <td class="px-3 py-2">Needs more practice on stress and linking sounds.</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
