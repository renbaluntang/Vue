<template>
  <div class="p-3.5 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-6 animate-in fade-in duration-500 pb-32">
    <!-- Header with Status Indicator -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1">
      <div>
        <div class="flex items-center gap-2">
          <span
            class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold transition"
            :class="hasUnsavedChanges ? 'bg-amber-50 text-amber-800 border border-amber-300' : 'bg-emerald-50 text-emerald-800 border border-emerald-200'"
          >
            <span class="w-1.5 h-1.5 rounded-full" :class="hasUnsavedChanges ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'"></span>
            {{ hasUnsavedChanges ? 'Unsaved changes' : 'All changes saved' }}
          </span>
          <span v-if="lastSavedTime" class="text-xs text-zinc-400 font-normal">
            • Last saved {{ lastSavedTime }}
          </span>
        </div>

        <h1 class="text-xl sm:text-2xl lg:text-3xl font-extrabold text-zinc-900 tracking-tight mt-1">Student Profile</h1>
        <p class="text-xs sm:text-sm text-zinc-500 font-normal mt-0.5">Manage your personal information, class preferences, and account security.</p>
      </div>

      <!-- Main Save Button -->
      <div class="flex items-center gap-2">
        <button
          v-if="hasUnsavedChanges"
          @click="discardChanges"
          class="px-4 py-2.5 rounded-xl border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-700 font-medium text-xs sm:text-sm transition active:scale-95"
        >
          Discard
        </button>

        <button
          @click="saveProfile"
          :disabled="isSavingProfile"
          class="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white font-medium text-xs sm:text-sm shadow-xs transition active:scale-95 disabled:opacity-50"
        >
          <span v-if="isSavingProfile" class="flex items-center gap-1.5">
            <svg class="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Saving...
          </span>
          <span v-else-if="isProfileSaved" class="text-emerald-300 flex items-center gap-1">✓ Saved!</span>
          <span v-else>Save All Changes</span>
        </button>
      </div>
    </div>

    <!-- Alert / Toast Notifications -->
    <div
      v-if="toastMessage"
      class="rounded-xl p-3.5 text-xs font-semibold flex items-center justify-between border animate-in fade-in slide-in-from-top-2"
      :class="toastType === 'success' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-rose-50 text-rose-800 border-rose-200'"
    >
      <div class="flex items-center gap-2">
        <span class="text-base">{{ toastType === 'success' ? '✓' : '⚠️' }}</span>
        <span>{{ toastMessage }}</span>
      </div>
      <button @click="toastMessage = null" class="font-bold text-xs p-1">✕</button>
    </div>

    <!-- 1. Profile Identity Hero Card -->
    <div class="bg-white border border-zinc-200/80 rounded-2xl p-4 sm:p-6 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
      <div class="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6">
        <div class="relative group">
          <img
            :src="user.profile.photo"
            alt="Profile Avatar"
            class="w-20 h-20 sm:w-24 sm:h-24 rounded-full shadow-xs object-cover border-2 border-white ring-2 ring-zinc-200"
          />
          <button
            type="button"
            @click="triggerPhotoUpload"
            class="absolute inset-0 flex items-center justify-center rounded-full bg-zinc-900/65 text-[11px] font-bold uppercase tracking-wider text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100 focus:opacity-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-2"
          >
            Replace
          </button>
          <input
            ref="photoInputRef"
            type="file"
            accept="image/*"
            class="hidden"
            @change="handlePhotoSelected"
          />
        </div>

        <div class="text-center sm:text-left space-y-1.5 flex-1">
          <div class="flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <h2 class="text-lg sm:text-xl font-bold text-zinc-900">{{ form.firstName }} {{ form.lastName }}</h2>
            <span class="px-2.5 py-0.5 rounded-md bg-zinc-100 text-zinc-700 text-xs font-semibold border border-zinc-200/60">
              {{ user.profile.level }}
            </span>
          </div>
          <p class="text-xs text-zinc-400 font-medium">
            {{ form.romaji || `${form.lastName} ${form.firstName}` }} • Member since {{ user.profile.memberSince }}
          </p>

          <div class="pt-1.5 flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <span class="inline-flex items-center gap-1 px-2.5 py-0.5 bg-amber-50 text-amber-800 text-[11px] sm:text-xs font-medium rounded-md border border-amber-200/60">
              <span>🔥</span> {{ user.stats.currentStreak }} Day Streak
            </span>
            <span class="inline-flex items-center gap-1 px-2.5 py-0.5 bg-zinc-100 text-zinc-700 text-[11px] sm:text-xs font-medium rounded-md border border-zinc-200/60">
              <span>🎓</span> {{ user.stats.totalLessons }} Lessons Completed
            </span>
            <span class="inline-flex items-center gap-1 px-2.5 py-0.5 bg-emerald-50 text-emerald-700 text-[11px] sm:text-xs font-medium rounded-md border border-emerald-200/60">
              <i class="fa-solid fa-coins"></i> {{ user.profile.pointsBalance }} Points Available
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- 2. Personal Information Card -->
    <div
      class="bg-white border rounded-2xl p-4 sm:p-6 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-4 transition-all duration-300"
      :class="isPersonalDirty ? 'border-amber-300 ring-1 ring-amber-100' : 'border-zinc-200/80'"
    >
      <div class="border-b border-zinc-100 pb-3 flex items-center justify-between">
        <div>
          <h2 class="text-sm sm:text-base font-bold text-zinc-900 flex items-center gap-2">
            <span>👤</span> Personal Information
          </h2>
          <p class="text-xs text-zinc-400 mt-0.5">Your official name and basic demographic details.</p>
        </div>
        <span v-if="isPersonalDirty" class="text-[11px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/60">
          Modified
        </span>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label class="block text-xs font-semibold text-zinc-700 mb-1.5">First Name <span class="text-rose-500">*</span></label>
          <input
            type="text"
            v-model="form.firstName"
            class="w-full rounded-xl border border-zinc-200 bg-zinc-50/50 py-2.5 px-3.5 text-base sm:text-sm font-medium text-zinc-800 outline-none focus:bg-white focus:border-zinc-400 transition"
            placeholder="e.g. Taro"
          />
        </div>

        <div>
          <label class="block text-xs font-semibold text-zinc-700 mb-1.5">Last Name <span class="text-rose-500">*</span></label>
          <input
            type="text"
            v-model="form.lastName"
            class="w-full rounded-xl border border-zinc-200 bg-zinc-50/50 py-2.5 px-3.5 text-base sm:text-sm font-medium text-zinc-800 outline-none focus:bg-white focus:border-zinc-400 transition"
            placeholder="e.g. Yamada"
          />
        </div>

        <div>
          <label class="block text-xs font-semibold text-zinc-700 mb-1.5">Display Name for Teachers (Romaji)</label>
          <input
            type="text"
            v-model="form.romaji"
            class="w-full rounded-xl border border-zinc-200 bg-zinc-50/50 py-2.5 px-3.5 text-base sm:text-sm font-medium text-zinc-800 outline-none focus:bg-white focus:border-zinc-400 transition"
            placeholder="e.g. Taro Yamada"
          />
          <p class="text-[11px] text-zinc-400 mt-1">This is how your name will appear on the teacher schedule.</p>
        </div>

        <div>
          <label class="block text-xs font-semibold text-zinc-700 mb-1.5">Gender <span class="text-rose-500">*</span></label>
          <div class="grid grid-cols-2 gap-2">
            <label
              v-for="option in GENDERS"
              :key="option.value"
              :class="`flex cursor-pointer items-center justify-center gap-2 rounded-xl border py-2.5 px-3 text-xs sm:text-sm font-medium transition active:scale-95 ${
                form.gender === option.value
                  ? 'border-zinc-900 bg-zinc-900 text-white'
                  : 'border-zinc-200 bg-zinc-50/60 text-zinc-700 hover:bg-zinc-100'
              }`"
            >
              <input type="radio" class="sr-only" :value="option.value" v-model="form.gender" />
              <span>{{ option.label }}</span>
            </label>
          </div>
        </div>

        <div class="sm:col-span-2">
          <label class="block text-xs font-semibold text-zinc-700 mb-1.5">Date of Birth <span class="text-rose-500">*</span></label>
          <div class="grid grid-cols-2 gap-3">
            <select
              v-model.number="form.birthYear"
              class="w-full rounded-xl border border-zinc-200 bg-zinc-50/50 py-2.5 px-3.5 text-base sm:text-sm font-medium text-zinc-800 outline-none focus:bg-white focus:border-zinc-400 transition"
            >
              <option v-for="year in BIRTH_YEARS" :key="year" :value="year">{{ year }}</option>
            </select>
            <select
              v-model.number="form.birthMonth"
              class="w-full rounded-xl border border-zinc-200 bg-zinc-50/50 py-2.5 px-3.5 text-base sm:text-sm font-medium text-zinc-800 outline-none focus:bg-white focus:border-zinc-400 transition"
            >
              <option v-for="(label, index) in MONTHS" :key="label" :value="index + 1">{{ label }}</option>
            </select>
          </div>
        </div>
      </div>
    </div>

    <!-- 3. Contact & Google Meet Integration Card -->
    <div
      class="bg-white border rounded-2xl p-4 sm:p-6 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-4 transition-all duration-300"
      :class="isContactDirty ? 'border-amber-300 ring-1 ring-amber-100' : 'border-zinc-200/80'"
    >
      <div class="border-b border-zinc-100 pb-3 flex items-center justify-between">
        <div>
          <h2 class="text-sm sm:text-base font-bold text-zinc-900 flex items-center gap-2">
            <span>🌐</span> Contact & Class Delivery
          </h2>
          <p class="text-xs text-zinc-400 mt-0.5">Manage email notifications and Google Meet account.</p>
        </div>
        <span v-if="isContactDirty" class="text-[11px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/60">
          Modified
        </span>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label class="block text-xs font-semibold text-zinc-700 mb-1.5">Registered Email Address <span class="text-rose-500">*</span></label>
          <input
            type="email"
            v-model="form.email"
            class="w-full rounded-xl border border-zinc-200 bg-zinc-50/50 py-2.5 px-3.5 text-base sm:text-sm font-medium text-zinc-800 outline-none focus:bg-white focus:border-zinc-400 transition"
          />
          <p class="text-[11px] text-zinc-400 mt-1">Used for password recovery, billing receipts, and account alerts.</p>
        </div>

        <div>
          <label class="block text-xs font-semibold text-zinc-700 mb-1.5">Google Account (Gmail) <span class="text-rose-500">*</span></label>
          <input
            type="email"
            v-model="form.googleAccount"
            class="w-full rounded-xl border border-zinc-200 bg-zinc-50/50 py-2.5 px-3.5 text-base sm:text-sm font-medium text-zinc-800 outline-none focus:bg-white focus:border-zinc-400 transition"
          />
          <p class="text-[11px] text-zinc-400 mt-1">Used by instructors to invite you to live Google Meet rooms.</p>
        </div>
      </div>
    </div>

    <!-- 4. Learning Preferences & Goals Card -->
    <div
      class="bg-white border rounded-2xl p-4 sm:p-6 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-4 transition-all duration-300"
      :class="isLearningDirty ? 'border-amber-300 ring-1 ring-amber-100' : 'border-zinc-200/80'"
    >
      <div class="border-b border-zinc-100 pb-3 flex items-center justify-between">
        <div>
          <h2 class="text-sm sm:text-base font-bold text-zinc-900 flex items-center gap-2">
            <span>🎯</span> Learning Objectives & Schedule
          </h2>
          <p class="text-xs text-zinc-400 mt-0.5">Customize your curriculum focus and scheduling timezone.</p>
        </div>
        <span v-if="isLearningDirty" class="text-[11px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/60">
          Modified
        </span>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label class="block text-xs font-semibold text-zinc-700 mb-1.5">Student Timezone</label>
          <select
            v-model="form.timezone"
            class="w-full rounded-xl border border-zinc-200 bg-zinc-50/50 py-2.5 px-3.5 text-base sm:text-sm font-medium text-zinc-800 outline-none focus:bg-white focus:border-zinc-400 transition"
          >
            <option v-for="zone in TIMEZONES" :key="zone.value" :value="zone.value">{{ zone.label }}</option>
          </select>
        </div>

        <div>
          <label class="block text-xs font-semibold text-zinc-700 mb-1.5">Primary Learning Objective</label>
          <select
            v-model="form.learningObjective"
            class="w-full rounded-xl border border-zinc-200 bg-zinc-50/50 py-2.5 px-3.5 text-base sm:text-sm font-medium text-zinc-800 outline-none focus:bg-white focus:border-zinc-400 transition"
          >
            <option v-for="obj in LEARNING_OBJECTIVES" :key="obj.value" :value="obj.value">{{ obj.label }}</option>
          </select>
        </div>

        <div class="sm:col-span-2">
          <label class="block text-xs font-semibold text-zinc-700 mb-1.5">Target Goal & Focus Areas</label>
          <input
            type="text"
            v-model="form.targetGoal"
            placeholder="e.g. Business Meetings, IELTS 7.5, Accent Reduction"
            class="w-full rounded-xl border border-zinc-200 bg-zinc-50/50 py-2.5 px-3.5 text-base sm:text-sm font-medium text-zinc-800 outline-none focus:bg-white focus:border-zinc-400 transition"
          />
        </div>
      </div>
    </div>

    <!-- 5. PASSWORD & ACCOUNT SECURITY (2-BUTTON BANNER CARD DESIGN SIMILAR TO PLAN & LEDGER) -->
    <div class="bg-white border border-zinc-200/80 rounded-2xl p-4 sm:p-6 shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div class="space-y-1">
        <div class="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Password & Account Security</div>
        <div class="text-base font-bold text-zinc-900 flex items-center gap-2">
          <span>Password & Credentials</span>
          <span class="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200/60">
            Protected
          </span>
        </div>
        <p class="text-xs text-zinc-500">
          Keep your student account safe with a strong, unique password.
        </p>
      </div>

      <!-- 2 Action Buttons -->
      <div class="flex items-center gap-2 shrink-0">
        <button
          type="button"
          @click="openForgotPasswordModal"
          class="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-800 font-medium text-xs text-center transition active:scale-95"
        >
          Forgot Password
        </button>
        <button
          type="button"
          @click="openChangePasswordModal"
          class="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white font-medium text-xs text-center transition active:scale-95 shadow-xs"
        >
          Change Password
        </button>
      </div>
    </div>

    <!-- 6. Active Plan & Points Quick Card -->
    <div class="bg-white border border-zinc-200/80 rounded-2xl p-4 sm:p-6 shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div class="space-y-1">
        <div class="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Active Plan & Ledger</div>
        <div class="text-base font-bold text-zinc-900 flex items-center gap-2">
          <span>{{ user.planName }}</span>
          <span class="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200/60">Active</span>
        </div>
        <p class="text-xs text-zinc-500">
          {{ user.profile.pointsBalance }} points remaining • Valid until {{ user.profile.pointsExpiry }}
        </p>
      </div>

      <div class="flex items-center gap-2 shrink-0">
        <RouterLink
          to="/points"
          class="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-800 font-medium text-xs text-center transition active:scale-95"
        >
          View Point History
        </RouterLink>
        <RouterLink
          to="/purchase"
          class="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white font-medium text-xs text-center transition active:scale-95 shadow-xs"
        >
          Purchase Points
        </RouterLink>
      </div>
    </div>

    <!-- 7. FLOATING SAVE BAR (Appears automatically when changes are made) -->
    <transition
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="transform translate-y-12 opacity-0"
      enter-to-class="transform translate-y-0 opacity-100"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="transform translate-y-0 opacity-100"
      leave-to-class="transform translate-y-12 opacity-0"
    >
      <div
        v-if="hasUnsavedChanges"
        class="fixed bottom-20 lg:bottom-6 left-1/2 -translate-x-1/2 w-[calc(100%-1.5rem)] max-w-xl bg-zinc-900 text-white px-4 sm:px-5 py-3 rounded-2xl shadow-2xl z-40 flex items-center justify-between gap-3 border border-zinc-700"
      >
        <div class="flex items-center gap-2 min-w-0">
          <p class="text-xs font-medium text-zinc-200 truncate">
            You have unsaved profile changes.
          </p>
        </div>

        <div class="flex items-center gap-2 shrink-0">
          <button
            @click="discardChanges"
            class="px-3 py-1.5 rounded-xl text-xs font-medium text-zinc-400 hover:text-white transition active:scale-95"
          >
            Discard
          </button>
          <button
            @click="saveProfile"
            :disabled="isSavingProfile"
            class="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs transition active:scale-95 shadow-sm"
          >
            <span v-if="isSavingProfile">Saving...</span>
            <span v-else>Save Changes</span>
          </button>
        </div>
      </div>
    </transition>

    <!-- 8. CHANGE PASSWORD MODAL -->
    <div
      v-if="showChangePasswordModal"
      class="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-zinc-900/50 backdrop-blur-xs animate-in fade-in"
      @click="closeChangePasswordModal"
    >
      <div
        class="bg-white rounded-t-3xl sm:rounded-2xl max-w-lg w-full p-5 sm:p-6 shadow-2xl space-y-4 border border-zinc-200 animate-in slide-in-from-bottom-5"
        @click.stop
      >
        <!-- Modal Header -->
        <div class="flex items-start justify-between border-b border-zinc-100 pb-3">
          <div class="flex items-center gap-2.5">
            <div class="w-9 h-9 rounded-xl bg-zinc-100 flex items-center justify-center text-base">
              🔒
            </div>
            <div>
              <h3 class="text-sm sm:text-base font-bold text-zinc-900">Change Password</h3>
              <p class="text-[11px] text-zinc-400">Enter your current password and choose a new one</p>
            </div>
          </div>
          <button
            @click="closeChangePasswordModal"
            class="w-7 h-7 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-500 flex items-center justify-center text-xs font-bold transition"
          >
            ✕
          </button>
        </div>

        <!-- Password Change Form -->
        <form @submit.prevent="handlePasswordUpdate" class="space-y-4">
          <!-- Current Password with "Forgot" shortcut -->
          <div>
            <div class="flex items-center justify-between mb-1">
              <label class="block text-xs font-semibold text-zinc-700">Current Password <span class="text-rose-500">*</span></label>
              <button
                type="button"
                @click="switchToForgotPassword"
                class="text-[11px] text-zinc-400 hover:text-zinc-800 underline"
              >
                Forgot current password?
              </button>
            </div>
            <div class="relative">
              <input
                :type="showCurrentPassword ? 'text' : 'password'"
                autocomplete="current-password"
                v-model="currentPassword"
                placeholder="Enter your current password"
                class="w-full rounded-xl border border-zinc-200 bg-zinc-50/50 py-2.5 pl-3.5 pr-10 text-base sm:text-sm font-medium text-zinc-800 outline-none focus:bg-white focus:border-zinc-400 transition"
              />
              <button
                type="button"
                @click="showCurrentPassword = !showCurrentPassword"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700 p-1 text-xs"
                tabindex="-1"
              >
                {{ showCurrentPassword ? '🙈' : '👁️' }}
              </button>
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <!-- New Password -->
            <div>
              <label class="block text-xs font-semibold text-zinc-700 mb-1">New Password <span class="text-rose-500">*</span></label>
              <div class="relative">
                <input
                  :type="showNewPassword ? 'text' : 'password'"
                  autocomplete="new-password"
                  v-model="newPassword"
                  placeholder="At least 8 chars"
                  class="w-full rounded-xl border border-zinc-200 bg-zinc-50/50 py-2.5 pl-3.5 pr-10 text-base sm:text-sm font-medium text-zinc-800 outline-none focus:bg-white focus:border-zinc-400 transition"
                />
                <button
                  type="button"
                  @click="showNewPassword = !showNewPassword"
                  class="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700 p-1 text-xs"
                  tabindex="-1"
                >
                  {{ showNewPassword ? '🙈' : '👁️' }}
                </button>
              </div>

              <!-- Strength Bar -->
              <div v-if="newPassword" class="mt-2 space-y-1">
                <div class="flex items-center justify-between text-[11px]">
                  <span class="text-zinc-400">Strength:</span>
                  <span :class="strengthTextColor" class="font-bold">{{ passwordStrengthText }}</span>
                </div>
                <div class="w-full h-1.5 rounded-full bg-zinc-100 overflow-hidden flex gap-1">
                  <div
                    class="h-full rounded-full transition-all duration-300"
                    :class="strengthBarColor"
                    :style="{ width: `${(passwordScore / 4) * 100}%` }"
                  ></div>
                </div>
              </div>
            </div>

            <!-- Confirm New Password -->
            <div>
              <label class="block text-xs font-semibold text-zinc-700 mb-1">Confirm Password <span class="text-rose-500">*</span></label>
              <div class="relative">
                <input
                  :type="showConfirmPassword ? 'text' : 'password'"
                  autocomplete="new-password"
                  v-model="confirmPassword"
                  placeholder="Re-enter new password"
                  class="w-full rounded-xl border border-zinc-200 bg-zinc-50/50 py-2.5 pl-3.5 pr-10 text-base sm:text-sm font-medium text-zinc-800 outline-none focus:bg-white focus:border-zinc-400 transition"
                />
                <button
                  type="button"
                  @click="showConfirmPassword = !showConfirmPassword"
                  class="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700 p-1 text-xs"
                  tabindex="-1"
                >
                  {{ showConfirmPassword ? '🙈' : '👁️' }}
                </button>
              </div>

              <p v-if="confirmPassword && newPassword !== confirmPassword" class="text-[11px] font-medium text-rose-500 mt-1 flex items-center gap-1">
                <span>✕</span> Passwords do not match
              </p>
              <p v-else-if="confirmPassword && newPassword === confirmPassword" class="text-[11px] font-medium text-emerald-600 mt-1 flex items-center gap-1">
                <span>✓</span> Passwords match
              </p>
            </div>
          </div>

          <!-- Requirements Checklist -->
          <div class="p-3 rounded-xl bg-zinc-50 border border-zinc-100 text-[11px] text-zinc-500 space-y-1">
            <div class="font-semibold text-zinc-700">Password requirements:</div>
            <div class="flex items-center gap-1.5" :class="newPassword.length >= 8 ? 'text-emerald-700 font-medium' : 'text-zinc-400'">
              <span>{{ newPassword.length >= 8 ? '✓' : '○' }}</span>
              <span>Minimum 8 characters in length</span>
            </div>
            <div class="flex items-center gap-1.5" :class="/[A-Za-z]/.test(newPassword) && /\d/.test(newPassword) ? 'text-emerald-700 font-medium' : 'text-zinc-400'">
              <span>{{ /[A-Za-z]/.test(newPassword) && /\d/.test(newPassword) ? '✓' : '○' }}</span>
              <span>Include both letters and numbers</span>
            </div>
          </div>

          <!-- Modal Action Buttons -->
          <div class="flex items-center justify-end gap-2 pt-2 border-t border-zinc-100">
            <button
              type="button"
              @click="closeChangePasswordModal"
              class="px-4 py-2 rounded-xl text-xs font-medium text-zinc-600 hover:bg-zinc-100 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              :disabled="!isPasswordValid || isUpdatingPassword"
              class="px-5 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white font-medium text-xs transition active:scale-95 shadow-xs disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5"
            >
              <svg v-if="isUpdatingPassword" class="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span v-if="isUpdatingPassword">Updating...</span>
              <span v-else>Update Password</span>
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- 9. FORGOT PASSWORD / EMAIL RESET MODAL -->
    <div
      v-if="showForgotPasswordModal"
      class="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-zinc-900/50 backdrop-blur-xs animate-in fade-in"
      @click="closeForgotPasswordModal"
    >
      <div
        class="bg-white rounded-t-3xl sm:rounded-2xl max-w-md w-full p-5 sm:p-6 shadow-2xl space-y-4 border border-zinc-200 animate-in slide-in-from-bottom-5"
        @click.stop
      >
        <!-- Modal Header -->
        <div class="flex items-start justify-between border-b border-zinc-100 pb-3">
          <div class="flex items-center gap-2.5">
            <div class="w-9 h-9 rounded-xl bg-zinc-100 flex items-center justify-center text-base">
              🔑
            </div>
            <div>
              <h3 class="text-sm sm:text-base font-bold text-zinc-900">Forgot Password?</h3>
              <p class="text-[11px] text-zinc-400">Reset your password via verified email</p>
            </div>
          </div>
          <button
            @click="closeForgotPasswordModal"
            class="w-7 h-7 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-500 flex items-center justify-center text-xs font-bold transition"
          >
            ✕
          </button>
        </div>

        <!-- Initial Request Screen -->
        <div v-if="!isResetEmailSent" class="space-y-4 text-xs text-zinc-600 leading-relaxed">
          <p>
            We will send a secure password reset link to your registered email address:
          </p>

          <div class="p-3.5 rounded-xl bg-zinc-50 border border-zinc-200/80 flex items-center gap-2.5">
            <span class="text-base">📧</span>
            <div class="min-w-0">
              <div class="text-[10px] uppercase font-bold text-zinc-400">Registered Email</div>
              <div class="text-xs font-bold text-zinc-900 truncate">{{ form.email }}</div>
            </div>
          </div>

          <p class="text-[11px] text-zinc-400">
            Clicking the link inside the email will allow you to create a new password without needing your old one.
          </p>

          <div class="flex items-center justify-end gap-2 pt-2 border-t border-zinc-100">
            <button
              @click="closeForgotPasswordModal"
              class="px-4 py-2 rounded-xl text-xs font-medium text-zinc-600 hover:bg-zinc-100 transition"
            >
              Cancel
            </button>
            <button
              @click="sendPasswordResetEmail"
              :disabled="isSendingResetEmail"
              class="px-5 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white font-medium text-xs transition active:scale-95 shadow-xs disabled:opacity-50 flex items-center gap-1.5"
            >
              <svg v-if="isSendingResetEmail" class="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span v-if="isSendingResetEmail">Sending Link...</span>
              <span v-else>Send Reset Link</span>
            </button>
          </div>
        </div>

        <!-- Success Screen -->
        <div v-else class="space-y-4 text-center py-2 animate-in fade-in">
          <div class="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 text-xl font-bold flex items-center justify-center mx-auto">
            ✓
          </div>
          <div>
            <h4 class="text-sm font-bold text-zinc-900">Password Reset Link Sent!</h4>
            <p class="text-xs text-zinc-500 mt-1">
              We have sent instructions to <strong class="text-zinc-800">{{ form.email }}</strong>. Please check your inbox and spam folder.
            </p>
          </div>

          <div class="pt-2 flex flex-col gap-2">
            <button
              @click="closeForgotPasswordModal"
              class="w-full py-2.5 rounded-xl bg-zinc-900 text-white font-medium text-xs active:scale-95 shadow-xs"
            >
              Done
            </button>
            <button
              :disabled="resendCountdown > 0"
              @click="sendPasswordResetEmail"
              class="text-[11px] font-semibold text-zinc-500 hover:text-zinc-800 transition disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {{ resendCountdown > 0 ? `Resend link in ${resendCountdown}s` : 'Didn\'t receive email? Resend' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, reactive } from 'vue';
import { useUserStore } from '../../stores/useUserStore';

const user = useUserStore();

// Local working form state to track modifications vs saved store data
const form = reactive({
  firstName: user.profile.firstName || 'Taro',
  lastName: user.profile.lastName || 'Yamada',
  romaji: user.profile.romaji || 'Taro Yamada',
  gender: user.profile.gender || 'male',
  birthYear: user.profile.birthYear || 1994,
  birthMonth: user.profile.birthMonth || 7,
  email: user.profile.email || 'taro.yamada@example.com',
  googleAccount: user.profile.googleAccount || 'taro.yamada@gmail.com',
  timezone: user.profile.timezone || 'Asia/Tokyo (JST)',
  learningObjective: user.profile.learningObjective || 'business',
  targetGoal: user.profile.targetGoal || 'Business Negotiations & IELTS 7.5',
});

// Snapshot of last saved state
const savedSnapshot = ref(JSON.stringify(form));
const lastSavedTime = ref('');

const isSavingProfile = ref(false);
const isProfileSaved = ref(false);
const toastMessage = ref(null);
const toastType = ref('success');
const photoInputRef = ref(null);

// Modal states
const showChangePasswordModal = ref(false);
const showForgotPasswordModal = ref(false);

const isSendingResetEmail = ref(false);
const isResetEmailSent = ref(false);
const resendCountdown = ref(0);
let countdownTimer = null;

// Dirty checks
const isPersonalDirty = computed(() => {
  const current = JSON.parse(savedSnapshot.value);
  return (
    form.firstName !== current.firstName ||
    form.lastName !== current.lastName ||
    form.romaji !== current.romaji ||
    form.gender !== current.gender ||
    form.birthYear !== current.birthYear ||
    form.birthMonth !== current.birthMonth
  );
});

const isContactDirty = computed(() => {
  const current = JSON.parse(savedSnapshot.value);
  return (
    form.email !== current.email ||
    form.googleAccount !== current.googleAccount
  );
});

const isLearningDirty = computed(() => {
  const current = JSON.parse(savedSnapshot.value);
  return (
    form.timezone !== current.timezone ||
    form.learningObjective !== current.learningObjective ||
    form.targetGoal !== current.targetGoal
  );
});

const hasUnsavedChanges = computed(() => {
  return JSON.stringify(form) !== savedSnapshot.value;
});

// Password change state
const currentPassword = ref('');
const newPassword = ref('');
const confirmPassword = ref('');
const showCurrentPassword = ref(false);
const showNewPassword = ref(false);
const showConfirmPassword = ref(false);
const isUpdatingPassword = ref(false);

const GENDERS = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
];

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const thisYear = new Date().getFullYear();
const BIRTH_YEARS = Array.from({ length: 80 }, (_, i) => thisYear - 16 - i);

const LEARNING_OBJECTIVES = [
  { value: 'business', label: 'Work & business communication' },
  { value: 'higher-education', label: 'Higher education & academic' },
  { value: 'exam', label: 'Exam preparation (IELTS, TOEIC, TOEFL)' },
  { value: 'living-abroad', label: 'Living or working abroad' },
  { value: 'travel', label: 'Travel & hospitality' },
  { value: 'general', label: 'General daily conversation' },
];

const TIMEZONES = [
  { value: 'Asia/Tokyo (JST)', label: 'UTC+09:00 — Tokyo (Asia)' },
  { value: 'Asia/Manila (PHT)', label: 'UTC+08:00 — Manila (Asia)' },
  { value: 'Asia/Shanghai (CST)', label: 'UTC+08:00 — Shanghai (Asia)' },
  { value: 'Europe/London (GMT)', label: 'UTC+00:00 — London (Europe)' },
  { value: 'America/New_York (EST)', label: 'UTC-05:00 — New York (America)' },
];

// Password strength calculation
const passwordScore = computed(() => {
  if (!newPassword.value) return 0;
  let score = 0;
  if (newPassword.value.length >= 8) score++;
  if (newPassword.value.length >= 12) score++;
  if (/[A-Z]/.test(newPassword.value) && /[a-z]/.test(newPassword.value)) score++;
  if (/\d/.test(newPassword.value) || /[^A-Za-z0-9]/.test(newPassword.value)) score++;
  return score;
});

const passwordStrengthText = computed(() => {
  if (passwordScore.value <= 1) return 'Weak';
  if (passwordScore.value === 2 || passwordScore.value === 3) return 'Medium';
  return 'Strong';
});

const strengthTextColor = computed(() => {
  if (passwordScore.value <= 1) return 'text-rose-500';
  if (passwordScore.value <= 3) return 'text-amber-500';
  return 'text-emerald-600';
});

const strengthBarColor = computed(() => {
  if (passwordScore.value <= 1) return 'bg-rose-500';
  if (passwordScore.value <= 3) return 'bg-amber-500';
  return 'bg-emerald-500';
});

const isPasswordValid = computed(() => {
  return (
    currentPassword.value.length > 0 &&
    newPassword.value.length >= 8 &&
    /[A-Za-z]/.test(newPassword.value) &&
    /\d/.test(newPassword.value) &&
    newPassword.value === confirmPassword.value
  );
});

const openChangePasswordModal = () => {
  currentPassword.value = '';
  newPassword.value = '';
  confirmPassword.value = '';
  showChangePasswordModal.value = true;
};

const closeChangePasswordModal = () => {
  showChangePasswordModal.value = false;
};

const switchToForgotPassword = () => {
  closeChangePasswordModal();
  openForgotPasswordModal();
};

const handlePasswordUpdate = () => {
  if (!isPasswordValid.value) return;

  isUpdatingPassword.value = true;
  setTimeout(() => {
    isUpdatingPassword.value = false;
    closeChangePasswordModal();
    showToast('Your account password has been updated successfully.', 'success');
  }, 900);
};

const openForgotPasswordModal = () => {
  isResetEmailSent.value = false;
  showForgotPasswordModal.value = true;
};

const closeForgotPasswordModal = () => {
  showForgotPasswordModal.value = false;
  if (countdownTimer) clearInterval(countdownTimer);
};

const sendPasswordResetEmail = () => {
  isSendingResetEmail.value = true;

  setTimeout(() => {
    isSendingResetEmail.value = false;
    isResetEmailSent.value = true;
    resendCountdown.value = 60;

    if (countdownTimer) clearInterval(countdownTimer);
    countdownTimer = setInterval(() => {
      if (resendCountdown.value > 0) {
        resendCountdown.value--;
      } else {
        clearInterval(countdownTimer);
      }
    }, 1000);

    showToast(`Password reset link sent to ${form.email}`, 'success');
  }, 1000);
};

const triggerPhotoUpload = () => {
  photoInputRef.value?.click();
};

const handlePhotoSelected = (event) => {
  const file = event.target.files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    if (e.target?.result) {
      user.profile.photo = e.target.result;
      showToast('Profile photo updated successfully!', 'success');
    }
  };
  reader.readAsDataURL(file);
};

const showToast = (message, type = 'success') => {
  toastMessage.value = message;
  toastType.value = type;
  setTimeout(() => {
    if (toastMessage.value === message) {
      toastMessage.value = null;
    }
  }, 4000);
};

const discardChanges = () => {
  const original = JSON.parse(savedSnapshot.value);
  Object.assign(form, original);
  showToast('Reverted unsaved changes to previous saved values.', 'success');
};

const saveProfile = () => {
  isSavingProfile.value = true;

  setTimeout(() => {
    // Commit working form values to the user store
    Object.assign(user.profile, {
      firstName: form.firstName,
      lastName: form.lastName,
      romaji: form.romaji,
      gender: form.gender,
      birthYear: form.birthYear,
      birthMonth: form.birthMonth,
      email: form.email,
      googleAccount: form.googleAccount,
      timezone: form.timezone,
      learningObjective: form.learningObjective,
      targetGoal: form.targetGoal,
    });

    savedSnapshot.value = JSON.stringify(form);
    isSavingProfile.value = false;
    isProfileSaved.value = true;

    const now = new Date();
    lastSavedTime.value = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    showToast('All personal information and contact details saved successfully!', 'success');

    setTimeout(() => {
      isProfileSaved.value = false;
    }, 3000);
  }, 600);
};
</script>
