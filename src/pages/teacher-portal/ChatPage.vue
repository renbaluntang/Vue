<template>
  <div class="p-3 sm:p-5 lg:p-6 max-w-7xl mx-auto space-y-4">
    <!-- Header -->
    <header class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div class="min-w-0">
        <div class="flex items-center gap-3">
          <div class="h-10 w-10 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 text-slate-900 flex items-center justify-center font-black shadow-md shadow-amber-500/20">
            <i class="fa-solid fa-comments text-lg"></i>
          </div>
          <div>
            <div class="flex items-center gap-2">
              <h1 class="text-xl sm:text-2xl font-black tracking-tight text-slate-900">Student Messages</h1>
              <span class="px-2 py-0.5 rounded-full bg-slate-900 text-white text-[10px] font-black tracking-wider uppercase">
                Direct Chat
              </span>
            </div>
            <p class="text-xs sm:text-sm text-slate-500 font-medium">
              Real-time student communications, lesson follow-ups, and class material sharing.
            </p>
          </div>
        </div>
      </div>

      <!-- Quick status indicator & stats -->
      <div class="flex items-center gap-2 text-xs font-bold text-slate-600 flex-wrap">
        <span class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 shadow-xs">
          <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Online as Jirvy Dela Torre</span>
        </span>
        <span v-if="totalUnreadCount > 0" class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 text-slate-950 font-black shadow-xs">
          <i class="fa-solid fa-bell text-[11px]"></i>
          <span>{{ totalUnreadCount }} Unread</span>
        </span>
      </div>
    </header>

    <!-- Main Chat Shell: 2-column split (Directory / Chat) -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-4 h-[calc(100vh-12rem)] min-h-[36rem] rounded-3xl overflow-hidden bg-slate-100/60 p-1 border border-slate-200/90 shadow-sm">
      
      <!-- ================= LEFT COLUMN: CONVERSATION LIST ================= -->
      <div
        class="lg:col-span-4 flex flex-col rounded-[22px] border border-slate-200/80 bg-white shadow-xs overflow-hidden"
        :class="activeStudentId && isMobileThreadOpen ? 'hidden lg:flex' : 'flex'"
      >
        <!-- Header & Search -->
        <div class="p-3.5 border-b border-slate-100 bg-slate-50/80 space-y-2.5">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <h2 class="text-xs font-black uppercase tracking-wider text-slate-700">Conversations</h2>
              <span class="px-2 py-0.5 rounded-full bg-slate-200 text-[10px] font-black text-slate-700 tabular-nums">
                {{ studentsList.length }}
              </span>
            </div>
            <!-- Filter Pills (All / Unread / Online) -->
            <div class="flex items-center gap-1 text-[11px] font-bold">
              <button
                type="button"
                @click="filterMode = 'all'"
                class="px-2 py-0.5 rounded-lg transition"
                :class="filterMode === 'all' ? 'bg-slate-900 text-white font-black' : 'text-slate-500 hover:text-slate-900'"
              >
                All
              </button>
              <button
                type="button"
                @click="filterMode = 'unread'"
                class="px-2 py-0.5 rounded-lg transition relative"
                :class="filterMode === 'unread' ? 'bg-amber-500 text-slate-950 font-black' : 'text-slate-500 hover:text-slate-900'"
              >
                Unread
                <span v-if="totalUnreadCount > 0" class="ml-0.5 text-[10px]">({{ totalUnreadCount }})</span>
              </button>
            </div>
          </div>

          <div class="relative">
            <i class="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs"></i>
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search conversations, notes..."
              class="w-full pl-8 pr-7 py-2 text-xs rounded-xl border border-slate-200 bg-white placeholder-slate-400 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-200/40"
            />
            <button
              v-if="searchQuery"
              @click="searchQuery = ''"
              type="button"
              class="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
            >
              <i class="fa-solid fa-xmark"></i>
            </button>
          </div>
        </div>

        <!-- Student Items List -->
        <div class="flex-1 overflow-y-auto p-2 space-y-1 divide-y divide-slate-50">
          <button
            v-for="student in filteredStudents"
            :key="student.id"
            type="button"
            @click="selectStudent(student.id)"
            class="w-full rounded-2xl p-3 text-left transition flex items-start gap-3 relative group"
            :class="activeStudentId === student.id
              ? 'bg-amber-500/10 border border-amber-300/80 shadow-xs'
              : 'hover:bg-slate-50 border border-transparent'"
          >
            <!-- Avatar with online indicator -->
            <div class="relative shrink-0">
              <AppImage
                :src="student.photo"
                :alt="student.name"
                class="w-11 h-11 rounded-2xl object-cover ring-1 ring-slate-200"
              />
              <span
                v-if="student.online"
                class="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 ring-2 ring-white"
                title="Online now"
              ></span>
              <span
                v-else
                class="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-slate-300 ring-2 ring-white"
                title="Offline"
              ></span>
            </div>

            <!-- Student info & preview message -->
            <div class="flex-1 min-w-0">
              <div class="flex items-center justify-between gap-1 mb-0.5">
                <p class="text-xs font-black text-slate-900 truncate">
                  {{ student.name }}
                </p>
                <span class="text-[10px] font-bold text-slate-400 shrink-0 tabular-nums">
                  {{ getLastMessageTime(student.id) }}
                </span>
              </div>

              <div class="flex items-center gap-1.5 mb-1">
                <span class="px-1.5 py-0.2 rounded-md bg-slate-100 text-[10px] font-black text-slate-600 truncate max-w-[130px]">
                  {{ student.latestSubject }}
                </span>
                <span class="text-[10px] text-slate-400 font-medium truncate">
                  &bull; {{ student.totalClassesTaken }} {{ student.totalClassesTaken === 1 ? 'class' : 'classes' }}
                </span>
              </div>

              <!-- Typing Indicator or Last message snippet -->
              <p
                v-if="studentTypingId === student.id"
                class="text-[11px] text-amber-600 font-bold truncate flex items-center gap-1"
              >
                <span class="inline-flex gap-0.5">
                  <span class="w-1 h-1 rounded-full bg-amber-500 animate-bounce"></span>
                  <span class="w-1 h-1 rounded-full bg-amber-500 animate-bounce [animation-delay:0.2s]"></span>
                  <span class="w-1 h-1 rounded-full bg-amber-500 animate-bounce [animation-delay:0.4s]"></span>
                </span>
                typing...
              </p>
              <p
                v-else
                class="text-[11px] truncate font-medium"
                :class="getUnreadCount(student.id) > 0 ? 'text-slate-900 font-bold' : 'text-slate-500'"
              >
                {{ getLastMessagePreview(student.id) }}
              </p>
            </div>

            <!-- Unread badge count -->
            <div
              v-if="getUnreadCount(student.id) > 0"
              class="shrink-0 self-center w-5 h-5 rounded-full bg-amber-500 text-slate-950 text-[10px] font-black flex items-center justify-center shadow-xs animate-pulse"
            >
              {{ getUnreadCount(student.id) }}
            </div>
          </button>

          <div v-if="filteredStudents.length === 0" class="text-center py-12 px-4 space-y-2">
            <div class="w-10 h-10 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto text-sm">
              <i class="fa-solid fa-inbox"></i>
            </div>
            <p class="text-xs font-bold text-slate-600">No conversations match your filter</p>
            <button
              type="button"
              @click="filterMode = 'all'; searchQuery = ''"
              class="text-[11px] font-black text-amber-600 hover:underline"
            >
              Reset filters
            </button>
          </div>
        </div>
      </div>

      <!-- ================= RIGHT COLUMN: CHAT WINDOW ================= -->
      <div
        class="lg:col-span-8 flex flex-col rounded-[22px] border border-slate-200/80 bg-white shadow-xs overflow-hidden"
        :class="!activeStudentId || !isMobileThreadOpen ? 'hidden lg:flex' : 'flex'"
      >
        <template v-if="activeStudent">
          <!-- Chat Header -->
          <div class="flex items-center justify-between border-b border-slate-100 bg-slate-50/90 px-4 py-3 sm:px-6 shrink-0">
            <div class="flex items-center gap-3 min-w-0">
              <!-- Mobile Back button -->
              <button
                type="button"
                @click="isMobileThreadOpen = false"
                class="lg:hidden p-2 -ml-2 rounded-xl text-slate-500 hover:bg-slate-200/60"
                aria-label="Back to conversations"
              >
                <i class="fa-solid fa-arrow-left text-sm"></i>
              </button>

              <div class="relative shrink-0">
                <AppImage
                  :src="activeStudent.photo"
                  :alt="activeStudent.name"
                  class="w-11 h-11 rounded-2xl object-cover ring-1 ring-slate-200"
                />
                <span
                  v-if="activeStudent.online"
                  class="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 ring-2 ring-white"
                ></span>
              </div>

              <div class="min-w-0">
                <div class="flex items-center gap-2">
                  <h3 class="text-sm sm:text-base font-black text-slate-900 truncate">
                    {{ activeStudent.name }}
                  </h3>
                  <span class="text-[10px] font-black text-amber-700 bg-amber-100 px-2 py-0.5 rounded-md">
                    Student #{{ activeStudent.id }}
                  </span>
                  <span
                    class="hidden sm:inline-flex items-center gap-1 text-[11px] font-bold"
                    :class="activeStudent.online ? 'text-emerald-600' : 'text-slate-400'"
                  >
                    <span class="w-1.5 h-1.5 rounded-full" :class="activeStudent.online ? 'bg-emerald-500' : 'bg-slate-300'"></span>
                    {{ activeStudent.online ? 'Active now' : 'Offline' }}
                  </span>
                </div>
                <p class="text-[11px] text-slate-500 truncate font-medium">
                  {{ activeStudent.membership }} &bull; {{ activeStudent.timezone }} &bull; Last class: {{ activeStudent.lastClassDate }}
                </p>
              </div>
            </div>

            <!-- Header Action buttons -->
            <div class="flex items-center gap-2">
              <!-- Open Student Detail Modal CTA -->
              <button
                type="button"
                @click="openStudentDetail"
                class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-700 text-xs font-bold transition shadow-2xs"
                title="View full student learning profile & lesson logs"
              >
                <i class="fa-solid fa-address-card text-slate-500"></i>
                <span class="hidden sm:inline">Student Profile</span>
              </button>
            </div>
          </div>

          <!-- Class Context Pill Banner -->
          <div class="bg-amber-50/70 border-b border-amber-100/90 px-4 sm:px-6 py-2 flex items-center justify-between text-xs text-amber-950">
            <div class="flex items-center gap-2 truncate">
              <i class="fa-solid fa-circle-info text-amber-600 text-xs shrink-0"></i>
              <span class="truncate">
                Completed <strong>{{ activeStudent.totalClassesTaken }}</strong> lessons &bull; Focus: <em>{{ activeStudent.preferredTopic }}</em>
              </span>
            </div>
            <div class="flex items-center gap-3 shrink-0">
              <span class="text-[11px] text-amber-800 font-bold hidden md:inline">
                Rating: {{ activeStudent.rating ? `★ ${activeStudent.rating}` : '5.0' }}
              </span>
              <RouterLink
                to="/reservations"
                class="text-[11px] font-black text-amber-700 hover:text-amber-900 underline underline-offset-2"
              >
                Booked Classes →
              </RouterLink>
            </div>
          </div>

          <!-- Messages Thread (Scrollable) -->
          <div ref="chatContainer" class="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-gradient-to-b from-slate-50/40 to-white">
            <!-- Day Divider -->
            <div class="flex items-center justify-center my-2">
              <span class="px-3 py-1 rounded-full bg-slate-100 border border-slate-200/60 text-[10px] font-black uppercase tracking-wider text-slate-500 shadow-2xs">
                Today's Conversation
              </span>
            </div>

            <div
              v-for="msg in currentMessages"
              :key="msg.id"
              class="flex flex-col group"
              :class="msg.sender === 'teacher' ? 'items-end' : 'items-start'"
            >
              <div class="flex items-end gap-2 max-w-[85%] sm:max-w-[75%]">
                <!-- Student Avatar for their messages -->
                <AppImage
                  v-if="msg.sender === 'student'"
                  :src="activeStudent.photo"
                  :alt="activeStudent.name"
                  class="w-7 h-7 rounded-xl object-cover shrink-0 mb-1 ring-1 ring-slate-200"
                />

                <div class="space-y-1">
                  <!-- Attached Lesson Material / Document Card -->
                  <div
                    v-if="msg.attachment"
                    class="rounded-2xl border p-3 flex items-center gap-3 transition shadow-xs"
                    :class="msg.sender === 'teacher'
                      ? 'bg-slate-800 text-white border-slate-700'
                      : 'bg-white text-slate-800 border-slate-200'"
                  >
                    <div class="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" :class="msg.sender === 'teacher' ? 'bg-amber-400 text-slate-950 font-black' : 'bg-amber-100 text-amber-700'">
                      <i :class="msg.attachment.icon || 'fa-solid fa-file-pdf'"></i>
                    </div>
                    <div class="min-w-0 flex-1">
                      <p class="text-xs font-black truncate">{{ msg.attachment.name }}</p>
                      <p class="text-[10px] opacity-75 font-medium">{{ msg.attachment.size }} &bull; {{ msg.attachment.type }}</p>
                    </div>
                    <a
                      :href="msg.attachment.url || '#'"
                      download
                      @click.prevent="alertDownloaded(msg.attachment.name)"
                      class="px-2.5 py-1 rounded-lg text-xs font-black transition"
                      :class="msg.sender === 'teacher' ? 'bg-slate-700 hover:bg-slate-600 text-amber-300' : 'bg-slate-100 hover:bg-slate-200 text-slate-800'"
                      title="Download file"
                    >
                      <i class="fa-solid fa-download"></i>
                    </a>
                  </div>

                  <!-- Text bubble -->
                  <div
                    v-if="msg.text"
                    class="rounded-3xl px-4 py-2.5 text-sm shadow-xs transition leading-relaxed relative"
                    :class="msg.sender === 'teacher'
                      ? 'bg-slate-900 text-white rounded-br-xs selection:bg-amber-400 selection:text-slate-900'
                      : 'bg-white text-slate-800 border border-slate-200/90 rounded-bl-xs'"
                  >
                    <p class="whitespace-pre-wrap leading-relaxed">{{ msg.text }}</p>
                  </div>

                  <!-- Message Metadata & Reactions -->
                  <div
                    class="flex items-center gap-2 text-[10px] text-slate-400 px-1 font-medium"
                    :class="msg.sender === 'teacher' ? 'justify-end' : 'justify-start'"
                  >
                    <span class="tabular-nums">{{ msg.time }}</span>
                    <span v-if="msg.sender === 'teacher'" class="flex items-center gap-0.5">
                      <i class="fa-solid fa-check-double text-emerald-500 text-[10px]" title="Delivered & Read"></i>
                    </span>

                    <!-- Quick React Pill (Hover) -->
                    <div class="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 ml-1">
                      <button
                        type="button"
                        @click="toggleReaction(msg, '👍')"
                        class="px-1.5 py-0.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 text-[10px] transition"
                        title="React 👍"
                      >
                        👍
                      </button>
                      <button
                        type="button"
                        @click="toggleReaction(msg, '❤️')"
                        class="px-1.5 py-0.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 text-[10px] transition"
                        title="React ❤️"
                      >
                        ❤️
                      </button>
                    </div>

                    <!-- Existing reactions -->
                    <span
                      v-if="msg.reactions && msg.reactions.length"
                      class="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-[10px] font-black"
                    >
                      {{ msg.reactions.join(' ') }}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Student Typing Indicator In Chat Window -->
            <div
              v-if="studentTypingId === activeStudentId"
              class="flex items-end gap-2 max-w-[70%]"
            >
              <AppImage
                :src="activeStudent.photo"
                :alt="activeStudent.name"
                class="w-7 h-7 rounded-xl object-cover ring-1 ring-slate-200"
              />
              <div class="px-4 py-2.5 rounded-3xl bg-slate-100 rounded-bl-xs flex items-center gap-1.5 text-slate-500">
                <span class="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce"></span>
                <span class="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:0.2s]"></span>
                <span class="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:0.4s]"></span>
                <span class="text-[11px] font-bold ml-1 text-slate-600">{{ activeStudent.name.split(' ')[0] }} is typing...</span>
              </div>
            </div>
          </div>

          <!-- Chat Input Footer -->
          <div class="border-t border-slate-100 bg-white p-3 sm:p-4 shrink-0 space-y-2">
            <!-- Attached File Staging Pill (if any) -->
            <div
              v-if="stagedAttachment"
              class="flex items-center justify-between p-2 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900"
            >
              <div class="flex items-center gap-2 truncate">
                <i class="fa-solid fa-paperclip text-amber-600"></i>
                <span class="font-bold truncate">{{ stagedAttachment.name }}</span>
                <span class="text-[10px] text-amber-700 opacity-75">({{ stagedAttachment.size }})</span>
              </div>
              <button
                type="button"
                @click="stagedAttachment = null"
                class="text-amber-700 hover:text-amber-900 p-1 text-xs"
                title="Remove attachment"
              >
                <i class="fa-solid fa-xmark"></i>
              </button>
            </div>

            <!-- Quick Pre-made replies pills -->
            <div class="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              <span class="text-[10px] font-black uppercase text-slate-400 shrink-0">Quick reply:</span>
              <button
                v-for="quick in quickReplies"
                :key="quick"
                type="button"
                @click="sendQuickReply(quick)"
                class="px-2.5 py-1 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-[11px] font-bold text-slate-600 transition shrink-0 whitespace-nowrap active:scale-95"
              >
                {{ quick }}
              </button>
            </div>

            <!-- Message form -->
            <form @submit.prevent="sendMessage" class="flex items-end gap-2">
              <!-- Hidden file upload input -->
              <input
                ref="fileInputRef"
                type="file"
                class="hidden"
                @change="handleFileUpload"
              />

              <!-- Attach file button -->
              <button
                type="button"
                @click="triggerFileUpload"
                class="h-11 w-11 rounded-2xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-500 hover:text-slate-800 flex items-center justify-center text-sm transition shrink-0 active:scale-95"
                title="Attach PDF, lesson notes, or exercise audio"
              >
                <i class="fa-solid fa-paperclip"></i>
              </button>

              <div class="relative flex-1">
                <textarea
                  v-model="newMessageText"
                  rows="2"
                  placeholder="Type a message, lesson recap, or assignment note... (Enter to send)"
                  @keydown.enter.exact.prevent="sendMessage"
                  class="w-full px-4 py-2.5 text-sm rounded-2xl border border-slate-200 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-200/50 resize-none text-slate-800 placeholder-slate-400"
                ></textarea>
              </div>

              <button
                type="submit"
                :disabled="!newMessageText.trim() && !stagedAttachment"
                class="h-11 px-5 rounded-2xl bg-gradient-to-r from-brighture-gold to-brighture-gold-deep hover:brightness-105 active:scale-[0.98] text-slate-900 font-black text-sm flex items-center justify-center gap-1.5 shadow-md shadow-amber-500/20 transition disabled:opacity-40 disabled:pointer-events-none shrink-0"
              >
                <span>Send</span>
                <i class="fa-solid fa-paper-plane text-xs"></i>
              </button>
            </form>
          </div>
        </template>

        <!-- No active student selected -->
        <div v-else class="flex-1 flex flex-col items-center justify-center p-8 text-center bg-slate-50/50">
          <div class="w-14 h-14 rounded-3xl bg-amber-50 text-amber-600 flex items-center justify-center text-2xl mb-3 shadow-xs">
            <i class="fa-solid fa-comments"></i>
          </div>
          <h3 class="text-base font-extrabold text-slate-800">Select a student</h3>
          <p class="text-xs text-slate-500 max-w-xs mt-1">
            Choose a student from the directory on the left to start chatting and sending lesson follow-ups.
          </p>
        </div>
      </div>
    </div>

    <!-- Student Detail Modal (Integration) -->
    <StudentDetailModal
      v-if="isStudentModalOpen && activeStudentModalData"
      :student="activeStudentModalData"
      @close="isStudentModalOpen = false"
    />
  </div>
</template>

<script setup>
import { ref, computed, nextTick, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import AppImage from '../../components/AppImage.vue';
import StudentDetailModal from '../../components/teacher/StudentDetailModal.vue';

const route = useRoute();

// Students who have attended lessons or have active reservations with this teacher
const studentsList = ref([
  {
    id: 21,
    studentId: 21,
    name: 'Taro Yamada',
    studentName: 'Taro Yamada',
    photo: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=300&auto=format&fit=crop&q=80',
    studentPhoto: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=300&auto=format&fit=crop&q=80',
    membership: 'Regular',
    timezone: 'Asia/Tokyo (JST)',
    latestSubject: '[SF] Speech Fluency',
    totalClassesTaken: 8,
    lastClassDate: 'Sep 1, 2026',
    preferredTopic: 'Cross-Border Negotiations & Pitching',
    rating: 5.0,
    online: true,
  },
  {
    id: 34,
    studentId: 34,
    name: 'Aiko Tanaka',
    studentName: 'Aiko Tanaka',
    photo: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300&auto=format&fit=crop&q=80',
    studentPhoto: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300&auto=format&fit=crop&q=80',
    membership: 'Regular',
    timezone: 'Asia/Tokyo (JST)',
    latestSubject: '[PP101] Pronunciation — Vowels',
    totalClassesTaken: 5,
    lastClassDate: 'Sep 1, 2026',
    preferredTopic: 'Vowel contrasts: /æ/ versus /ʌ/',
    rating: 5.0,
    online: true,
  },
  {
    id: 12,
    studentId: 12,
    name: 'Kenji Sato',
    studentName: 'Kenji Sato',
    photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80',
    studentPhoto: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80',
    membership: 'Trial',
    timezone: 'Asia/Tokyo (JST)',
    latestSubject: '[DC] Daily Conversation',
    totalClassesTaken: 2,
    lastClassDate: 'Aug 31, 2026',
    preferredTopic: 'Everyday small talk & self-introduction',
    rating: 4.5,
    online: false,
  },
  {
    id: 45,
    studentId: 45,
    name: 'Mika Kobayashi',
    studentName: 'Mika Kobayashi',
    photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&auto=format&fit=crop&q=80',
    studentPhoto: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&auto=format&fit=crop&q=80',
    membership: 'Regular',
    timezone: 'Europe/London (BST)',
    latestSubject: '[RW] Reading & Writing',
    totalClassesTaken: 6,
    lastClassDate: 'Aug 30, 2026',
    preferredTopic: 'IELTS Task 2 essay structure',
    rating: 5.0,
    online: false,
  },
  {
    id: 58,
    studentId: 58,
    name: 'Daiki Suzuki',
    studentName: 'Daiki Suzuki',
    photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
    studentPhoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
    membership: 'Regular',
    timezone: 'Asia/Tokyo (JST)',
    latestSubject: '[LS1] Listening & Discussion',
    totalClassesTaken: 4,
    lastClassDate: 'Aug 29, 2026',
    preferredTopic: 'Tech Trends: AI & Workplace Automation',
    rating: 4.8,
    online: true,
  },
]);

// Seeded chat message histories per student ID
const chatHistory = ref({
  21: [
    {
      id: 'm1',
      sender: 'student',
      text: 'Good evening Teacher Jirvy! Thank you so much for today\'s Speech Fluency class on cross-border negotiations.',
      time: 'Sep 1, 18:35',
      reactions: ['👍'],
    },
    {
      id: 'm2',
      sender: 'teacher',
      text: 'Good evening Taro! You did a fantastic job with the counter-offer phrasing today. Remember to pause before delivering your key pitch point.',
      time: 'Sep 1, 18:40',
      reactions: [],
    },
    {
      id: 'm2_file',
      sender: 'teacher',
      text: 'Here is the executive negotiation phrasebook sheet we reviewed.',
      attachment: {
        name: 'Executive_Negotiation_Drills_SF.pdf',
        size: '1.2 MB',
        type: 'PDF Document',
        icon: 'fa-solid fa-file-pdf text-rose-500',
      },
      time: 'Sep 1, 18:41',
      reactions: ['❤️'],
    },
    {
      id: 'm3',
      sender: 'student',
      text: 'Understood! I will review the negotiation phrases before our next session tomorrow. Should I prepare an opening pitch draft?',
      time: 'Sep 1, 18:42',
      reactions: [],
    },
    {
      id: 'm4',
      sender: 'teacher',
      text: 'Yes please! A 1-minute intro will be great practice. Looking forward to our next class!',
      time: 'Sep 1, 18:45',
      reactions: [],
    },
  ],
  34: [
    {
      id: 'm5',
      sender: 'student',
      text: 'Hello Teacher Jirvy, I still find it difficult to distinguish /æ/ as in "cat" and /ʌ/ as in "cut". Do you have any audio drills?',
      time: 'Sep 1, 16:15',
      reactions: [],
    },
    {
      id: 'm6',
      sender: 'teacher',
      text: 'Hi Aiko! Keep your jaw slightly lower for /æ/. Practise the drill from our lesson with minimal pairs like cat/cut and bat/but.',
      time: 'Sep 1, 16:25',
      reactions: ['👍'],
    },
    {
      id: 'm6_extra',
      sender: 'student',
      text: 'Teacher Jirvy, could you send the audio clip when you have a free moment?',
      time: 'Sep 1, 16:30',
      reactions: [],
    },
  ],
  12: [
    {
      id: 'm7',
      sender: 'student',
      text: 'Teacher Jirvy, thank you for being patient with me during my first trial lesson. I was quite nervous.',
      time: 'Aug 31, 12:15',
      reactions: ['❤️'],
    },
    {
      id: 'm8',
      sender: 'teacher',
      text: 'You did very well Kenji! Natural conversation takes time. Keep practicing the self-introduction points we discussed.',
      time: 'Aug 31, 12:30',
      reactions: [],
    },
  ],
  45: [
    {
      id: 'm9',
      sender: 'student',
      text: 'Hi Jirvy, apologies for missing our previous session due to an emergency meeting. I have submitted my IELTS essay draft for your review.',
      time: 'Aug 30, 15:00',
      reactions: [],
    },
    {
      id: 'm10',
      sender: 'teacher',
      text: 'No worries Mika! I have received your essay and will go over the thesis structure during our next class.',
      time: 'Aug 30, 15:20',
      reactions: ['👍'],
    },
  ],
  58: [
    {
      id: 'm11',
      sender: 'student',
      text: 'Hi Jirvy! The tech article on AI automation you recommended was super interesting. Excited for our discussion next week!',
      time: 'Aug 29, 17:00',
      reactions: ['❤️'],
    },
  ],
});

const unreadCounts = ref({
  21: 0,
  34: 1,
  12: 0,
  45: 0,
  58: 0,
});

const activeStudentId = ref(21);
const isMobileThreadOpen = ref(true);
const searchQuery = ref('');
const filterMode = ref('all'); // 'all' | 'unread'
const newMessageText = ref('');
const chatContainer = ref(null);
const fileInputRef = ref(null);
const stagedAttachment = ref(null);

// Simulated typing indicator
const studentTypingId = ref(null);

// Student Detail Modal state
const isStudentModalOpen = ref(false);
const activeStudentModalData = ref(null);

const quickReplies = [
  'Thank you for today\'s class!',
  'Please review today\'s lesson material before our next class.',
  'Great pronunciation improvements today!',
  'See you in our next class!',
  'Here is the recap material from our lesson.',
];

const activeStudent = computed(() => {
  return studentsList.value.find(s => s.id === activeStudentId.value) || null;
});

const currentMessages = computed(() => {
  return chatHistory.value[activeStudentId.value] || [];
});

const totalUnreadCount = computed(() => {
  return Object.values(unreadCounts.value).reduce((sum, val) => sum + (val || 0), 0);
});

const filteredStudents = computed(() => {
  const q = searchQuery.value.trim().toLowerCase();
  return studentsList.value.filter(s => {
    const matchQuery = !q || s.name.toLowerCase().includes(q) || s.latestSubject.toLowerCase().includes(q);
    const matchUnread = filterMode.value === 'all' || (unreadCounts.value[s.id] > 0);
    return matchQuery && matchUnread;
  });
});

const selectStudent = (studentId) => {
  activeStudentId.value = studentId;
  isMobileThreadOpen.value = true;
  unreadCounts.value[studentId] = 0;
  scrollToBottom();
};

const getLastMessagePreview = (studentId) => {
  const msgs = chatHistory.value[studentId];
  if (!msgs || msgs.length === 0) return 'No messages yet';
  const last = msgs[msgs.length - 1];
  if (last.attachment && !last.text) return `📎 Attachment: ${last.attachment.name}`;
  return (last.sender === 'teacher' ? 'You: ' : '') + last.text;
};

const getLastMessageTime = (studentId) => {
  const msgs = chatHistory.value[studentId];
  if (!msgs || msgs.length === 0) return '';
  return msgs[msgs.length - 1].time;
};

const getUnreadCount = (studentId) => {
  return unreadCounts.value[studentId] || 0;
};

const scrollToBottom = () => {
  nextTick(() => {
    if (chatContainer.value) {
      chatContainer.value.scrollTop = chatContainer.value.scrollHeight;
    }
  });
};

const sendMessage = () => {
  const text = newMessageText.value.trim();
  const attachment = stagedAttachment.value;
  if ((!text && !attachment) || !activeStudentId.value) return;

  if (!chatHistory.value[activeStudentId.value]) {
    chatHistory.value[activeStudentId.value] = [];
  }

  const now = new Date();
  const timeStr = `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`;

  chatHistory.value[activeStudentId.value].push({
    id: 'm_' + Date.now(),
    sender: 'teacher',
    text,
    attachment: attachment || null,
    time: `Today, ${timeStr}`,
    reactions: [],
  });

  newMessageText.value = '';
  stagedAttachment.value = null;
  scrollToBottom();

  // Simulate an occasional student typing response after 1.5 seconds if Taro
  if (activeStudentId.value === 21) {
    setTimeout(() => {
      studentTypingId.value = 21;
      setTimeout(() => {
        studentTypingId.value = null;
        chatHistory.value[21].push({
          id: 'm_' + (Date.now() + 1),
          sender: 'student',
          text: 'Got it, thank you Teacher Jirvy! See you tomorrow.',
          time: 'Just now',
          reactions: [],
        });
        scrollToBottom();
      }, 2500);
    }, 1200);
  }
};

const sendQuickReply = (text) => {
  newMessageText.value = text;
  sendMessage();
};

const toggleReaction = (msg, emoji) => {
  if (!msg.reactions) msg.reactions = [];
  const idx = msg.reactions.indexOf(emoji);
  if (idx > -1) {
    msg.reactions.splice(idx, 1);
  } else {
    msg.reactions.push(emoji);
  }
};

const triggerFileUpload = () => {
  if (fileInputRef.value) {
    fileInputRef.value.click();
  }
};

const handleFileUpload = (e) => {
  const file = e.target.files?.[0];
  if (!file) return;

  stagedAttachment.value = {
    name: file.name,
    size: `${(file.size / 1024 / 1024).toFixed(1)} MB`,
    type: file.type || 'Document',
    icon: file.type.includes('image') ? 'fa-solid fa-image text-emerald-500' : 'fa-solid fa-file-pdf text-rose-500',
  };

  // Reset input
  e.target.value = '';
};

const alertDownloaded = (filename) => {
  // Graceful browser prompt
  alert(`Downloaded file: ${filename}`);
};

const openStudentDetail = () => {
  if (!activeStudent.value) return;
  activeStudentModalData.value = {
    ...activeStudent.value,
    studentId: activeStudent.value.id,
    studentName: activeStudent.value.name,
    studentPhoto: activeStudent.value.photo,
    category: activeStudent.value.membership || 'Regular',
    lessonClass: 'Online 1-on-1',
  };
  isStudentModalOpen.value = true;
};

// Check router query parameter on mount (e.g., /chat?student=34)
onMounted(() => {
  const queryStudentId = route.query.student ? parseInt(route.query.student, 10) : null;
  if (queryStudentId && studentsList.value.some(s => s.id === queryStudentId)) {
    selectStudent(queryStudentId);
  } else {
    scrollToBottom();
  }
});

watch(() => route.query.student, (newVal) => {
  const queryStudentId = newVal ? parseInt(newVal, 10) : null;
  if (queryStudentId && studentsList.value.some(s => s.id === queryStudentId)) {
    selectStudent(queryStudentId);
  }
});
</script>
