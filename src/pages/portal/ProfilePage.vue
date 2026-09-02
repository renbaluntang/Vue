<template>
  <div class="p-4 sm:p-6 lg:p-10 max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500 pb-32">
    <!-- Header with Status Indicator -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <!-- Nothing has been saved on a fresh load, so there is no status to
             report yet. The pill only appears once the form is dirty or a save
             has actually happened. -->
        <div v-if="hasUnsavedChanges || hasSavedOnce" class="flex items-center gap-2">
          <span
            class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition"
            :class="hasUnsavedChanges ? 'bg-amber-100 text-amber-900 border border-amber-300' : 'bg-emerald-100 text-emerald-900 border border-emerald-300'"
          >
            <span class="w-2 h-2 rounded-full" :class="hasUnsavedChanges ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'"></span>
            {{ hasUnsavedChanges ? 'Unsaved changes' : 'All changes saved' }}
          </span>
          <span v-if="lastSavedTime" class="text-xs text-slate-400 font-semibold">
            • Last saved at {{ lastSavedTime }}
          </span>
        </div>

        <h1 class="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1.5">Student Profile</h1>
        <p class="text-sm text-slate-500 font-medium mt-0.5">Manage your student credentials, online class preferences, and account security.</p>
      </div>

      <!-- Header Action Buttons — only there when there is something to save.
           They linger through the save and the "Changes Saved!" beat so the
           button does not vanish out from under the cursor on click. -->
      <div v-if="showSaveActions" class="flex items-center gap-2">
        <button
          v-if="hasUnsavedChanges"
          @click="discardChanges"
          class="px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs sm:text-sm transition active:scale-95"
        >
          Discard
        </button>

        <button
          @click="saveProfile"
          :disabled="isSavingProfile || hasPersonalErrors"
          :title="hasPersonalErrors ? 'Fill in your first and last name first' : undefined"
          class="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm shadow-sm hover:scale-105 active:scale-95 transition disabled:opacity-50"
        >
          <span v-if="isSavingProfile" class="flex items-center gap-2">
            <svg class="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Saving...
          </span>
          <span v-else-if="isProfileSaved" class="text-emerald-300 flex items-center gap-1.5">✓ Changes Saved!</span>
          <span v-else>Save All Changes</span>
        </button>
      </div>
    </div>

    <!-- Alert / Toast Notification — fixed, because saving usually happens from
         the sticky bar at the bottom with the top of the page scrolled away. -->
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0 -translate-y-3"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 -translate-y-3"
    >
      <div
        v-if="toastMessage"
        role="status"
        aria-live="polite"
        class="fixed top-4 left-4 right-4 sm:left-auto sm:right-6 sm:top-6 sm:w-auto sm:max-w-md z-[70] rounded-2xl p-4 text-xs sm:text-sm font-bold flex items-center justify-between gap-3 border shadow-xl"
        :class="toastType === 'success' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-rose-50 text-rose-800 border-rose-200'"
      >
        <div class="flex items-center gap-2 min-w-0">
          <span class="text-base shrink-0">{{ toastType === 'success' ? '✓' : '⚠️' }}</span>
          <span>{{ toastMessage }}</span>
        </div>
        <button @click="toastMessage = null" class="font-bold p-1 shrink-0 hover:opacity-70 transition" aria-label="Dismiss">✕</button>
      </div>
    </Transition>

    <!-- 1. Profile Hero & Avatar Card -->
    <div class="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-xs">
      <div class="flex flex-col sm:flex-row items-center sm:items-start gap-6">
        <div class="relative group">
          <img
            :src="user.profile.photo"
            alt="Profile Avatar"
            class="w-24 h-24 sm:w-28 sm:h-28 rounded-full shadow-lg object-cover border-4 border-white ring-4 ring-brighture-gold/20"
          />
          <button
            type="button"
            @click="triggerPhotoUpload"
            class="absolute inset-0 flex items-center justify-center rounded-full bg-slate-900/65 text-[11px] font-bold uppercase tracking-wider text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100 focus:opacity-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-brighture-gold focus-visible:ring-offset-2"
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

        <div class="text-center sm:text-left space-y-2 flex-1">
          <div class="flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <h2 class="text-2xl font-extrabold text-slate-900">{{ form.firstName }} {{ form.lastName }}</h2>
            <span class="px-2.5 py-0.5 rounded-full bg-brighture-cream text-brighture-bronze text-xs font-extrabold border border-brighture-gold/30">
              {{ user.profile.level }}
            </span>
          </div>
          <p class="text-sm text-slate-400 font-semibold">
            {{ form.romaji || `${form.lastName} ${form.firstName}` }} • Member since {{ user.profile.memberSince }}
          </p>

          <div class="pt-2 flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <span class="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-800 text-xs font-bold rounded-xl border border-amber-200">
              <span>🔥</span> {{ user.stats.currentStreak }} Day Streak
            </span>
            <span class="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-800 text-xs font-bold rounded-xl border border-emerald-200">
              <span>🎓</span> {{ user.stats.totalLessons }} Online Lessons Completed
            </span>
            <span class="inline-flex items-center gap-1.5 px-3 py-1 bg-brighture-cream text-brighture-bronze text-xs font-bold rounded-xl border border-brighture-gold/30">
              <i class="fa-solid fa-coins"></i> {{ user.profile.pointsBalance }} Points Available
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- 2. Personal Information Card -->
    <div
      class="bg-white border rounded-3xl p-6 sm:p-8 shadow-xs space-y-6 transition-all duration-300"
      :class="isPersonalDirty ? 'border-amber-300 ring-2 ring-amber-100' : 'border-slate-200/80'"
    >
      <div class="border-b border-slate-100 pb-4 flex items-center justify-between">
        <div>
          <h2 class="text-lg font-bold text-slate-900 flex items-center gap-2">
            <span class="w-2 h-5 rounded-full bg-brighture-gold"></span> Personal Information
          </h2>
          <p class="text-xs text-slate-500 mt-0.5">Your official name and basic demographic details.</p>
        </div>
        <span v-if="isPersonalDirty" class="text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-xl border border-amber-200">
          Unsaved Edits
        </span>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
        <div>
          <label for="pi-first-name" class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
            First Name <span class="text-rose-500" aria-hidden="true">*</span>
          </label>
          <input
            id="pi-first-name"
            type="text"
            v-model="form.firstName"
            @blur="touch('firstName')"
            required
            maxlength="40"
            autocomplete="given-name"
            :aria-invalid="fieldError('firstName') ? 'true' : 'false'"
            :aria-describedby="fieldError('firstName') ? 'pi-first-name-error' : undefined"
            :class="[FIELD_CLASS, fieldError('firstName') ? FIELD_INVALID : FIELD_VALID]"
            placeholder="e.g. Taro"
          />
          <p v-if="fieldError('firstName')" id="pi-first-name-error" class="text-[11px] font-semibold text-rose-600 mt-1.5 flex items-center gap-1">
            <i class="fa-solid fa-circle-exclamation text-[10px]"></i> {{ fieldError('firstName') }}
          </p>
        </div>

        <div>
          <label for="pi-last-name" class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
            Last Name <span class="text-rose-500" aria-hidden="true">*</span>
          </label>
          <input
            id="pi-last-name"
            type="text"
            v-model="form.lastName"
            @blur="touch('lastName')"
            required
            maxlength="40"
            autocomplete="family-name"
            :aria-invalid="fieldError('lastName') ? 'true' : 'false'"
            :aria-describedby="fieldError('lastName') ? 'pi-last-name-error' : undefined"
            :class="[FIELD_CLASS, fieldError('lastName') ? FIELD_INVALID : FIELD_VALID]"
            placeholder="e.g. Yamada"
          />
          <p v-if="fieldError('lastName')" id="pi-last-name-error" class="text-[11px] font-semibold text-rose-600 mt-1.5 flex items-center gap-1">
            <i class="fa-solid fa-circle-exclamation text-[10px]"></i> {{ fieldError('lastName') }}
          </p>
        </div>

        <div>
          <label for="pi-romaji" class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Teacher Display Name (Romaji)</label>
          <input
            id="pi-romaji"
            type="text"
            v-model="form.romaji"
            maxlength="60"
            autocomplete="nickname"
            :class="[FIELD_CLASS, FIELD_VALID]"
            placeholder="e.g. Taro Yamada"
          />
          <p class="text-[11px] text-slate-400 mt-1.5">
            Teachers see <strong class="text-slate-600">{{ displayNamePreview }}</strong> when scheduling.
          </p>
        </div>

        <div>
          <span class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
            Gender <span class="text-rose-500" aria-hidden="true">*</span>
          </span>
          <div role="radiogroup" aria-label="Gender" class="grid grid-cols-3 gap-2 sm:gap-3">
            <label
              v-for="option in GENDERS"
              :key="option.value"
              :class="`flex cursor-pointer items-center justify-center gap-2 rounded-2xl border py-3 px-2 text-center text-[13px] sm:text-sm font-semibold leading-tight transition ${
                form.gender === option.value
                  ? 'border-brighture-gold bg-brighture-cream text-brighture-bronze shadow-2xs'
                  : 'border-slate-200 bg-slate-50/50 text-slate-600 hover:border-slate-300'
              }`"
            >
              <input type="radio" class="sr-only" :value="option.value" v-model="form.gender" />
              <span>{{ option.label }}</span>
            </label>
          </div>
        </div>

        <div class="sm:col-span-2">
          <span class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
            Date of Birth <span class="text-rose-500" aria-hidden="true">*</span>
          </span>
          <div class="grid grid-cols-2 gap-3">
            <select
              v-model.number="form.birthYear"
              aria-label="Birth year"
              autocomplete="bday-year"
              :class="[FIELD_CLASS, FIELD_VALID]"
            >
              <option v-for="year in BIRTH_YEARS" :key="year" :value="year">{{ year }}</option>
            </select>
            <select
              v-model.number="form.birthMonth"
              aria-label="Birth month"
              autocomplete="bday-month"
              :class="[FIELD_CLASS, FIELD_VALID]"
            >
              <option v-for="(label, index) in MONTHS" :key="label" :value="index + 1">{{ label }}</option>
            </select>
          </div>
          <p class="text-[11px] text-slate-400 mt-1.5">
            You are <strong class="text-slate-600">{{ age }}</strong> &mdash; used to match you with
            age-appropriate lesson material. Never shown to other students.
          </p>
        </div>
      </div>
    </div>

    <!-- 3. Contact & Google Meet Integration Card -->
    <div
      class="bg-white border rounded-3xl p-6 sm:p-8 shadow-xs space-y-6 transition-all duration-300"
      :class="isContactDirty ? 'border-amber-300 ring-2 ring-amber-100' : 'border-slate-200/80'"
    >
      <div class="border-b border-slate-100 pb-4 flex items-center justify-between">
        <div>
          <h2 class="text-lg font-bold text-slate-900 flex items-center gap-2">
            <span class="w-2 h-5 rounded-full bg-brighture-gold"></span> Contact & Class Integrations
          </h2>
          <p class="text-xs text-slate-500 mt-0.5">Manage communication emails and Google Meet integration.</p>
        </div>
        <span v-if="isContactDirty" class="text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-xl border border-amber-200">
          Unsaved Edits
        </span>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
        <div>
          <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Registered Email Address <span class="text-rose-500">*</span></label>
          <input
            type="email"
            v-model="form.email"
            class="w-full rounded-2xl border border-slate-200 bg-slate-50/50 py-3 px-4 text-sm font-semibold text-slate-800 outline-none focus:bg-white focus:border-brighture-gold focus:ring-4 focus:ring-brighture-gold/20 transition"
          />
          <p class="text-[11px] text-slate-400 mt-1">Used for password recovery, payment receipts and official account notifications.</p>
        </div>

        <div>
          <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Google Account (Gmail) <span class="text-rose-500">*</span></label>
          <input
            type="email"
            v-model="form.googleAccount"
            class="w-full rounded-2xl border border-slate-200 bg-slate-50/50 py-3 px-4 text-sm font-semibold text-slate-800 outline-none focus:bg-white focus:border-brighture-gold focus:ring-4 focus:ring-brighture-gold/20 transition"
          />
          <p class="text-[11px] text-slate-400 mt-1">Used to invite you to live Google Meet online classroom links.</p>
        </div>
      </div>
    </div>

    <!-- 4. Learning Preferences & Goals Card -->
    <div
      class="bg-white border rounded-3xl p-6 sm:p-8 shadow-xs space-y-6 transition-all duration-300"
      :class="isLearningDirty ? 'border-amber-300 ring-2 ring-amber-100' : 'border-slate-200/80'"
    >
      <div class="border-b border-slate-100 pb-4 flex items-center justify-between">
        <div>
          <h2 class="text-lg font-bold text-slate-900 flex items-center gap-2">
            <span class="w-2 h-5 rounded-full bg-brighture-gold"></span> Learning Objectives & Schedule
          </h2>
          <p class="text-xs text-slate-500 mt-0.5">Customize your learning pathway and booking timezone.</p>
        </div>
        <span v-if="isLearningDirty" class="text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-xl border border-amber-200">
          Unsaved Edits
        </span>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
        <div>
          <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Student Timezone</label>
          <select
            v-model="form.timezone"
            class="w-full rounded-2xl border border-slate-200 bg-slate-50/50 py-3 px-4 text-sm font-semibold text-slate-800 outline-none focus:bg-white focus:border-brighture-gold focus:ring-4 focus:ring-brighture-gold/20 transition"
          >
            <option v-for="zone in TIMEZONES" :key="zone.value" :value="zone.value">{{ zone.label }}</option>
          </select>
        </div>

        <div>
          <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Primary Learning Objective</label>
          <select
            v-model="form.learningObjective"
            class="w-full rounded-2xl border border-slate-200 bg-slate-50/50 py-3 px-4 text-sm font-semibold text-slate-800 outline-none focus:bg-white focus:border-brighture-gold focus:ring-4 focus:ring-brighture-gold/20 transition"
          >
            <option v-for="obj in LEARNING_OBJECTIVES" :key="obj.value" :value="obj.value">{{ obj.label }}</option>
          </select>
        </div>

        <div class="sm:col-span-2">
          <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Target Study Goal & Focus</label>
          <input
            type="text"
            v-model="form.targetGoal"
            placeholder="e.g. Business Meetings, IELTS 7.5, Accent Reduction"
            class="w-full rounded-2xl border border-slate-200 bg-slate-50/50 py-3 px-4 text-sm font-semibold text-slate-800 outline-none focus:bg-white focus:border-brighture-gold focus:ring-4 focus:ring-brighture-gold/20 transition"
          />
        </div>
      </div>
    </div>

    <!-- 5. PASSWORD & ACCOUNT SECURITY (2-BUTTON BANNER CARD DESIGN SIMILAR TO PLAN & LEDGER) -->
    <div class="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div class="space-y-1">
        <div class="text-xs font-bold text-slate-400 uppercase tracking-wider">Password & Account Security</div>
        <div class="text-lg font-black text-slate-900 flex items-center gap-2">
          <span>Password & Credentials</span>
          <span class="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-extrabold">
            Protected
          </span>
        </div>
        <p class="text-xs text-slate-500 font-medium">
          Keep your student account safe with a strong, unique password.
        </p>
      </div>

      <!-- 2 Action Buttons -->
      <div class="flex items-center gap-3 shrink-0">
        <button
          type="button"
          @click="openForgotPasswordModal"
          class="flex-1 sm:flex-initial px-5 py-3 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs transition active:scale-95 text-center"
        >
          Forgot Password
        </button>
        <button
          type="button"
          @click="openChangePasswordModal"
          class="flex-1 sm:flex-initial px-5 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition active:scale-95 shadow-md text-center"
        >
          Change Password
        </button>
      </div>
    </div>

    <!-- 6. Active Membership & Points Overview Card -->
    <div class="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div class="space-y-1">
        <div class="text-xs font-bold text-slate-400 uppercase tracking-wider">Plan & Ledger Status</div>
        <div class="text-lg font-black text-slate-900 flex items-center gap-2">
          <span>{{ user.planName }}</span>
          <span class="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-extrabold">Active</span>
        </div>
        <p class="text-xs text-slate-500 font-medium">
          {{ user.profile.pointsBalance }} points available · Expires on {{ user.profile.pointsExpiry }}
        </p>
      </div>

      <div class="flex items-center gap-3 shrink-0">
        <RouterLink
          to="/points"
          class="flex-1 sm:flex-initial px-5 py-3 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs transition active:scale-95 text-center"
        >
          View Point History
        </RouterLink>
        <RouterLink
          to="/purchase"
          class="flex-1 sm:flex-initial px-5 py-3 rounded-2xl bg-[#FFCD00] hover:bg-[#FFD933] text-black font-bold text-xs transition active:scale-95 shadow-md text-center"
        >
          Purchase Points
        </RouterLink>
      </div>
    </div>

    <!-- 7. FLOATING SAVE BANNER (Appears on modified form changes) -->
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
        class="fixed bottom-20 lg:bottom-6 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-xl bg-slate-900 text-white px-5 py-3.5 rounded-2xl shadow-2xl z-40 flex items-center justify-between gap-4 border border-slate-700"
      >
        <div class="flex items-center gap-2.5 min-w-0">
          <p class="text-xs sm:text-sm font-semibold text-slate-200 truncate">
            You have unsaved profile changes.
          </p>
        </div>

        <div class="flex items-center gap-2 shrink-0">
          <button
            @click="discardChanges"
            class="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition active:scale-95"
          >
            Discard
          </button>
          <button
            @click="saveProfile"
            :disabled="isSavingProfile || hasPersonalErrors"
            class="px-5 py-2 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed bg-brighture-gold text-slate-950 font-extrabold text-xs transition active:scale-95 shadow-md hover:bg-brighture-gold-deep"
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
      class="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in"
      @click="closeChangePasswordModal"
    >
      <div
        class="bg-white rounded-t-3xl sm:rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl space-y-5 border border-slate-200 animate-in slide-in-from-bottom-5"
        @click.stop
      >
        <!-- Modal Header -->
        <div class="flex items-start justify-between border-b border-slate-100 pb-3.5">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-2xl bg-slate-100 text-slate-800 flex items-center justify-center text-lg font-bold">
              🔒
            </div>
            <div>
              <h3 class="text-base font-extrabold text-slate-900">Change Password</h3>
              <p class="text-xs text-slate-400 font-medium">Enter your current password and choose a new one</p>
            </div>
          </div>
          <button
            @click="closeChangePasswordModal"
            class="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center text-xs font-bold transition"
          >
            ✕
          </button>
        </div>

        <!-- Password Change Form -->
        <form @submit.prevent="handlePasswordUpdate" class="space-y-5">
          <!-- Current Password with "Forgot" shortcut -->
          <div>
            <div class="flex items-center justify-between mb-1.5">
              <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider">Current Password <span class="text-rose-500">*</span></label>
              <button
                type="button"
                @click="switchToForgotPassword"
                class="text-xs text-slate-500 hover:text-slate-900 font-bold underline"
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
                class="w-full rounded-2xl border border-slate-200 bg-slate-50/50 py-3 pl-4 pr-11 text-sm font-semibold text-slate-800 outline-none focus:bg-white focus:border-brighture-gold focus:ring-4 focus:ring-brighture-gold/20 transition"
              />
              <button
                type="button"
                @click="showCurrentPassword = !showCurrentPassword"
                class="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-1 text-xs"
                tabindex="-1"
              >
                {{ showCurrentPassword ? '🙈' : '👁️' }}
              </button>
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
            <!-- New Password -->
            <div>
              <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">New Password <span class="text-rose-500">*</span></label>
              <div class="relative">
                <input
                  :type="showNewPassword ? 'text' : 'password'"
                  autocomplete="new-password"
                  v-model="newPassword"
                  placeholder="At least 8 chars"
                  class="w-full rounded-2xl border border-slate-200 bg-slate-50/50 py-3 pl-4 pr-11 text-sm font-semibold text-slate-800 outline-none focus:bg-white focus:border-brighture-gold focus:ring-4 focus:ring-brighture-gold/20 transition"
                />
                <button
                  type="button"
                  @click="showNewPassword = !showNewPassword"
                  class="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-1 text-xs"
                  tabindex="-1"
                >
                  {{ showNewPassword ? '🙈' : '👁️' }}
                </button>
              </div>

              <!-- Strength Bar -->
              <div v-if="newPassword" class="mt-2 space-y-1.5">
                <div class="flex items-center justify-between text-xs">
                  <span class="text-slate-400 font-medium">Strength:</span>
                  <span :class="strengthTextColor" class="font-bold">{{ passwordStrengthText }}</span>
                </div>
                <div class="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden flex gap-1">
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
              <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Confirm Password <span class="text-rose-500">*</span></label>
              <div class="relative">
                <input
                  :type="showConfirmPassword ? 'text' : 'password'"
                  autocomplete="new-password"
                  v-model="confirmPassword"
                  placeholder="Re-enter password"
                  class="w-full rounded-2xl border border-slate-200 bg-slate-50/50 py-3 pl-4 pr-11 text-sm font-semibold text-slate-800 outline-none focus:bg-white focus:border-brighture-gold focus:ring-4 focus:ring-brighture-gold/20 transition"
                />
                <button
                  type="button"
                  @click="showConfirmPassword = !showConfirmPassword"
                  class="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-1 text-xs"
                  tabindex="-1"
                >
                  {{ showConfirmPassword ? '🙈' : '👁️' }}
                </button>
              </div>

              <p v-if="confirmPassword && newPassword !== confirmPassword" class="text-xs font-bold text-rose-500 mt-1 flex items-center gap-1">
                <span>✕</span> Passwords do not match
              </p>
              <p v-else-if="confirmPassword && newPassword === confirmPassword" class="text-xs font-bold text-emerald-600 mt-1 flex items-center gap-1">
                <span>✓</span> Passwords match
              </p>
            </div>
          </div>

          <!-- Requirements Checklist -->
          <div class="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-xs text-slate-600 space-y-1.5">
            <div class="font-bold text-slate-800">Password requirements:</div>
            <div class="flex items-center gap-2" :class="newPassword.length >= 8 ? 'text-emerald-700 font-bold' : 'text-slate-400'">
              <span>{{ newPassword.length >= 8 ? '✓' : '○' }}</span>
              <span>Minimum 8 characters</span>
            </div>
            <div class="flex items-center gap-2" :class="/[A-Za-z]/.test(newPassword) && /\d/.test(newPassword) ? 'text-emerald-700 font-bold' : 'text-slate-400'">
              <span>{{ /[A-Za-z]/.test(newPassword) && /\d/.test(newPassword) ? '✓' : '○' }}</span>
              <span>Contains both letters and numbers</span>
            </div>
          </div>

          <!-- Modal Action Buttons -->
          <div class="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              @click="closeChangePasswordModal"
              class="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              :disabled="!isPasswordValid || isUpdatingPassword"
              class="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition active:scale-95 shadow-md disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <svg v-if="isUpdatingPassword" class="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
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
      class="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in"
      @click="closeForgotPasswordModal"
    >
      <div
        class="bg-white rounded-t-3xl sm:rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl space-y-5 border border-slate-200 animate-in slide-in-from-bottom-5"
        @click.stop
      >
        <!-- Modal Header -->
        <div class="flex items-start justify-between border-b border-slate-100 pb-3.5">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-2xl bg-brighture-cream text-brighture-bronze flex items-center justify-center text-lg font-bold border border-brighture-gold/30">
              🔑
            </div>
            <div>
              <h3 class="text-base font-extrabold text-slate-900">Forgot Password?</h3>
              <p class="text-xs text-slate-400 font-medium">Reset your password via verified email</p>
            </div>
          </div>
          <button
            @click="closeForgotPasswordModal"
            class="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center text-xs font-bold transition"
          >
            ✕
          </button>
        </div>

        <!-- Initial Request Screen -->
        <div v-if="!isResetEmailSent" class="space-y-4 text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
          <p>
            We will send a secure password reset link to your registered email address:
          </p>

          <div class="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-3">
            <span class="text-xl">📧</span>
            <div class="min-w-0">
              <div class="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Registered Email</div>
              <div class="text-xs sm:text-sm font-bold text-slate-900 truncate">{{ form.email }}</div>
            </div>
          </div>

          <p class="text-xs text-slate-400">
            Clicking the link inside your email will direct you to a secure page to set a new password immediately.
          </p>

          <div class="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              @click="closeForgotPasswordModal"
              class="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition"
            >
              Cancel
            </button>
            <button
              @click="sendPasswordResetEmail"
              :disabled="isSendingResetEmail"
              class="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition active:scale-95 shadow-md disabled:opacity-50 flex items-center gap-2"
            >
              <svg v-if="isSendingResetEmail" class="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
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
          <div class="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 text-2xl font-bold flex items-center justify-center mx-auto">
            ✓
          </div>
          <div>
            <h4 class="text-base font-extrabold text-slate-900">Password Reset Link Dispatched!</h4>
            <p class="text-xs sm:text-sm text-slate-500 mt-1">
              Instructions have been sent to <strong class="text-slate-800">{{ form.email }}</strong>. Please check your inbox and spam folder.
            </p>
          </div>

          <div class="pt-3 flex flex-col gap-2.5">
            <button
              @click="closeForgotPasswordModal"
              class="w-full py-3 rounded-2xl bg-slate-900 text-white font-bold text-xs active:scale-95 shadow-md"
            >
              Done
            </button>
            <button
              :disabled="resendCountdown > 0"
              @click="sendPasswordResetEmail"
              class="text-xs font-bold text-slate-500 hover:text-slate-800 transition disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {{ resendCountdown > 0 ? `Resend email in ${resendCountdown}s` : 'Didn\'t receive email? Resend' }}
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
// Shared input styling: one base, plus a valid/invalid focus ring so an error
// is visible from the field itself and not only from the message beneath it.
const FIELD_CLASS = 'w-full rounded-2xl border bg-slate-50/50 py-3 px-4 text-sm font-semibold text-slate-800 outline-none focus:bg-white transition';
const FIELD_VALID = 'border-slate-200 focus:border-brighture-gold focus:ring-4 focus:ring-brighture-gold/20';
const FIELD_INVALID = 'border-rose-300 bg-rose-50/40 focus:border-rose-400 focus:ring-4 focus:ring-rose-500/15';

// Errors only surface once a field has been visited, so the form doesn't shout
// at someone who hasn't typed anything yet.
const touched = reactive({ firstName: false, lastName: false });
const touch = (field) => {
  touched[field] = true;
  if (typeof form[field] === 'string') form[field] = form[field].trim();
};
const fieldError = (field) => {
  if (!touched[field]) return '';
  if (!form[field]?.trim()) return `${field === 'firstName' ? 'First' : 'Last'} name is required.`;
  return '';
};
const hasPersonalErrors = computed(() =>
  !form.firstName?.trim() || !form.lastName?.trim()
);

const displayNamePreview = computed(
  () => form.romaji?.trim() || `${form.firstName} ${form.lastName}`.trim() || 'your name'
);

const age = computed(() => {
  const now = new Date();
  let years = now.getFullYear() - form.birthYear;
  if (now.getMonth() + 1 < form.birthMonth) years -= 1;
  return Number.isFinite(years) ? `${years} years old` : '—';
});

const savedSnapshot = ref(JSON.stringify(form));
const lastSavedTime = ref('');
// Gates the saved-status pill: false until the student saves at least once.
const hasSavedOnce = ref(false);

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

// Saving clears the dirty flag, so the header actions have to outlive it or the
// button disappears mid-click and the confirmation never shows.
const showSaveActions = computed(
  () => hasUnsavedChanges.value || isSavingProfile.value || isProfileSaved.value
);

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
  { value: 'undisclosed', label: 'Prefer not to say' },
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
    hasSavedOnce.value = true;

    const now = new Date();
    lastSavedTime.value = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    showToast('All personal information and contact details saved successfully!', 'success');

    setTimeout(() => {
      isProfileSaved.value = false;
    }, 3000);
  }, 600);
};
</script>
