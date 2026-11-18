// Latest posts from the Announcement category of the Brighture blog. There is
// no backend, so this is a copy of that page taken on 2026-11-17; a live
// version would read the blog's feed instead. Newest first, with the pinned
// post on top, the same order the blog shows them.
export const ANNOUNCEMENTS_URL = 'https://brighture-edu.com/blog/en/category/announcement/';

export const announcements = [
  { id: 191, image: 'Curriculum_1-1', title: "We've launched a new 25-minute Free Conversation class!", date: '2026-10-29', pinned: true },
  { id: 181, image: 'Program_1-1', title: 'Now Offering Online Intensive Short-Term Programs', date: '2026-11-06' },
  { id: 179, image: 'WuTi_-_2026Nian9Yue03', title: "Brighture's trial lesson has been completely redesigned!", date: '2026-11-06' },
  { id: 190, image: 'Curriculum_1-1', title: 'Announcement of Exam Prep Writing Release', date: '2026-10-29' },
  { id: 205, image: 'News_1-1', title: 'Credit card payments are now available on all plans', date: '2026-09-29' },
  { id: 180, image: 'Plan_1-1', title: 'Announcement: U.S. Dollar Plans Now Available', date: '2026-09-25' },
  { id: 195, image: 'Announcement', title: 'Try a Free Lesson with Our New Teachers!', date: '2026-09-22' },
].map((post) => ({
  ...post,
  url: `https://brighture-edu.com/blog/en/post-${post.id}/`,
  // The 640x360 thumbnail the blog itself shows on its list page.
  image: `https://brighture-edu.com/media/images/${post.image}.2e16d0ba.fill-640x360.format-webp.webp`,
}));
