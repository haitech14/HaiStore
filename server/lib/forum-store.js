import { shouldUseSharedSupabaseData } from './data-source.js';
import { getSupabaseAdmin } from './supabase-auth.js';

function ensureForumSupabase() {
  const supabase = getSupabaseAdmin();
  if (!shouldUseSharedSupabaseData() || !supabase) {
    const error = new Error('Foro no disponible: configura Supabase y aplica la migración 013_forum.sql');
    error.statusCode = 503;
    throw error;
  }
  return supabase;
}

function isMissingTableError(message) {
  return /relation|schema cache|Could not find/i.test(message ?? '');
}

function slugifyTitle(title) {
  const base = String(title)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 72);
  return base || 'tema';
}

async function uniqueThreadSlug(supabase, title) {
  const base = slugifyTitle(title);
  let slug = base;
  let attempt = 0;
  while (attempt < 20) {
    const { data } = await supabase.from('forum_threads').select('id').eq('slug', slug).maybeSingle();
    if (!data) return slug;
    attempt += 1;
    slug = `${base}-${attempt}`;
  }
  return `${base}-${Date.now()}`;
}

function mapAuthor(profile) {
  if (!profile) return null;
  return {
    id: profile.id,
    name: profile.full_name ?? profile.email?.split('@')[0] ?? 'Usuario',
    email: profile.email ?? '',
    forumPoints: profile.forum_points ?? 0,
    forumLevel: profile.forum_level ?? 1,
    forumTitle: profile.forum_title ?? null,
  };
}

function mapCategory(row) {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    description: row.description ?? '',
    iconKey: row.icon_key,
    accentClass: row.accent_class,
    sortOrder: row.sort_order,
    threadCount: Number(row.thread_count ?? 0),
  };
}

function mapThread(row, category, author, lastReplyAuthor) {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    body: row.body,
    tags: row.tags ?? [],
    viewCount: row.view_count ?? 0,
    replyCount: row.reply_count ?? 0,
    isPinned: Boolean(row.is_pinned),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    lastReplyAt: row.last_reply_at,
    category: category
      ? { slug: category.slug, name: category.name, iconKey: category.icon_key, accentClass: category.accent_class }
      : null,
    author: mapAuthor(author),
    lastReplyAuthor: mapAuthor(lastReplyAuthor),
  };
}

function mapReply(row, author) {
  return {
    id: row.id,
    body: row.body,
    createdAt: row.created_at,
    author: mapAuthor(author),
  };
}

function mapEvent(row) {
  return {
    id: row.id,
    title: row.title,
    startsAt: row.starts_at,
    location: row.location ?? '',
  };
}

const THREAD_SELECT = `
  id, category_id, author_id, title, slug, body, tags,
  view_count, reply_count, is_pinned, last_reply_at, last_reply_by,
  created_at, updated_at,
  category:forum_categories ( id, slug, name, icon_key, accent_class ),
  author:profiles!forum_threads_author_id_fkey ( id, full_name, email, forum_points, forum_level, forum_title ),
  last_reply_author:profiles!forum_threads_last_reply_by_fkey ( id, full_name, email, forum_points, forum_level, forum_title )
`;

export async function readForumStats() {
  const supabase = ensureForumSupabase();

  const [membersRes, topicsRes, repliesRes] = await Promise.all([
    supabase.from('profiles').select('id', { count: 'exact', head: true }),
    supabase.from('forum_threads').select('id', { count: 'exact', head: true }),
    supabase.from('forum_replies').select('id', { count: 'exact', head: true }),
  ]);

  if (isMissingTableError(membersRes.error?.message)) {
    return { members: 0, topics: 0, replies: 0 };
  }

  return {
    members: membersRes.count ?? 0,
    topics: topicsRes.count ?? 0,
    replies: repliesRes.count ?? 0,
  };
}

export async function readForumCategories() {
  const supabase = ensureForumSupabase();

  const { data: categories, error } = await supabase
    .from('forum_categories')
    .select('id, slug, name, description, icon_key, accent_class, sort_order')
    .order('sort_order', { ascending: true });

  if (error) {
    if (isMissingTableError(error.message)) return [];
    throw new Error('No se pudieron cargar categorías del foro');
  }

  const { data: counts } = await supabase.from('forum_threads').select('category_id');

  const countMap = new Map();
  for (const row of counts ?? []) {
    countMap.set(row.category_id, (countMap.get(row.category_id) ?? 0) + 1);
  }

  return (categories ?? []).map((row) =>
    mapCategory({ ...row, thread_count: countMap.get(row.id) ?? 0 }),
  );
}

export async function readForumThreads(options = {}) {
  const supabase = ensureForumSupabase();
  const { categorySlug, sort = 'recent', q, limit = 20, offset = 0 } = options;

  let query = supabase.from('forum_threads').select(THREAD_SELECT, { count: 'exact' });

  if (categorySlug) {
    const { data: cat } = await supabase
      .from('forum_categories')
      .select('id')
      .eq('slug', categorySlug)
      .maybeSingle();
    if (!cat) return { threads: [], total: 0 };
    query = query.eq('category_id', cat.id);
  }

  if (q?.trim()) {
    const term = q.trim().replace(/[%_]/g, '');
    query = query.or(`title.ilike.%${term}%,body.ilike.%${term}%`);
  }

  if (sort === 'popular') {
    query = query.order('reply_count', { ascending: false }).order('view_count', { ascending: false });
  } else {
    query = query
      .order('is_pinned', { ascending: false })
      .order('last_reply_at', { ascending: false, nullsFirst: false })
      .order('created_at', { ascending: false });
  }

  query = query.range(offset, offset + limit - 1);

  const { data, error, count } = await query;
  if (error) {
    if (isMissingTableError(error.message)) return { threads: [], total: 0 };
    throw new Error('No se pudieron cargar los temas del foro');
  }

  const threads = (data ?? []).map((row) =>
    mapThread(row, row.category, row.author, row.last_reply_author),
  );

  return { threads, total: count ?? threads.length };
}

export async function readForumThreadBySlug(slug, { incrementViews = false } = {}) {
  const supabase = ensureForumSupabase();

  const { data, error } = await supabase.from('forum_threads').select(THREAD_SELECT).eq('slug', slug).maybeSingle();

  if (error) {
    if (isMissingTableError(error.message)) return null;
    throw new Error('No se pudo cargar el tema');
  }
  if (!data) return null;

  if (incrementViews) {
    await supabase.rpc('forum_increment_thread_views', { p_thread_id: data.id });
    data.view_count = (data.view_count ?? 0) + 1;
  }

  const { data: replies, error: repliesError } = await supabase
    .from('forum_replies')
    .select(
      'id, body, created_at, author:profiles!forum_replies_author_id_fkey ( id, full_name, email, forum_points, forum_level, forum_title )',
    )
    .eq('thread_id', data.id)
    .order('created_at', { ascending: true });

  if (repliesError && !isMissingTableError(repliesError.message)) {
    throw new Error('No se pudieron cargar las respuestas');
  }

  return {
    thread: mapThread(data, data.category, data.author, data.last_reply_author),
    replies: (replies ?? []).map((row) => mapReply(row, row.author)),
  };
}

export async function createForumThread({ authorId, categorySlug, title, body, tags = [] }) {
  const supabase = ensureForumSupabase();

  const { data: category, error: catError } = await supabase
    .from('forum_categories')
    .select('id')
    .eq('slug', categorySlug)
    .maybeSingle();

  if (catError || !category) {
    throw new Error('Categoría no encontrada');
  }

  const slug = await uniqueThreadSlug(supabase, title);
  const row = {
    category_id: category.id,
    author_id: authorId,
    title: title.trim(),
    slug,
    body: body.trim(),
    tags: Array.isArray(tags) ? tags.filter(Boolean).slice(0, 8) : [],
  };

  const { data, error } = await supabase.from('forum_threads').insert(row).select(THREAD_SELECT).single();

  if (error) throw new Error('No se pudo crear el tema');

  return mapThread(data, data.category, data.author, data.last_reply_author);
}

export async function createForumReply({ authorId, threadSlug, body }) {
  const supabase = ensureForumSupabase();

  const { data: thread, error: threadError } = await supabase
    .from('forum_threads')
    .select('id')
    .eq('slug', threadSlug)
    .maybeSingle();

  if (threadError || !thread) throw new Error('Tema no encontrado');

  const { data, error } = await supabase
    .from('forum_replies')
    .insert({
      thread_id: thread.id,
      author_id: authorId,
      body: body.trim(),
    })
    .select(
      'id, body, created_at, author:profiles!forum_replies_author_id_fkey ( id, full_name, email, forum_points, forum_level, forum_title )',
    )
    .single();

  if (error) throw new Error('No se pudo publicar la respuesta');

  return mapReply(data, data.author);
}

export async function readPopularThreads(limit = 5) {
  const supabase = ensureForumSupabase();
  const { data, error } = await supabase
    .from('forum_threads')
    .select('slug, title, reply_count')
    .order('reply_count', { ascending: false })
    .limit(limit);

  if (error) {
    if (isMissingTableError(error.message)) return [];
    throw new Error('No se pudieron cargar temas populares');
  }

  return (data ?? []).map((row, index) => ({
    rank: index + 1,
    slug: row.slug,
    title: row.title,
    replyCount: row.reply_count ?? 0,
  }));
}

export async function readFeaturedMembers(limit = 5) {
  const supabase = ensureForumSupabase();
  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name, email, forum_points, forum_level, forum_title')
    .order('forum_points', { ascending: false })
    .limit(limit);

  if (error) {
    if (isMissingTableError(error.message)) return [];
    throw new Error('No se pudieron cargar miembros destacados');
  }

  return (data ?? [])
    .filter((row) => (row.forum_points ?? 0) > 0)
    .map((row) => ({
      ...mapAuthor(row),
      rank: 0,
    }))
    .map((member, index) => ({ ...member, rank: index + 1 }));
}

export async function readForumEvents(limit = 5) {
  const supabase = ensureForumSupabase();
  const { data, error } = await supabase
    .from('forum_events')
    .select('id, title, starts_at, location')
    .gte('starts_at', new Date().toISOString())
    .order('starts_at', { ascending: true })
    .limit(limit);

  if (error) {
    if (isMissingTableError(error.message)) return [];
    throw new Error('No se pudieron cargar eventos');
  }

  return (data ?? []).map(mapEvent);
}

export async function readLatestForumActivity(limit = 5) {
  const supabase = ensureForumSupabase();
  const { data, error } = await supabase
    .from('forum_replies')
    .select(
      `
      id, created_at, body,
      author:profiles!forum_replies_author_id_fkey ( id, full_name, email ),
      thread:forum_threads ( slug, title )
    `,
    )
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    if (isMissingTableError(error.message)) return [];
    throw new Error('No se pudieron cargar publicaciones recientes');
  }

  return (data ?? []).map((row) => ({
    id: row.id,
    createdAt: row.created_at,
    excerpt: String(row.body ?? '').slice(0, 120),
    authorName: row.author?.full_name ?? row.author?.email?.split('@')[0] ?? 'Usuario',
    threadSlug: row.thread?.slug ?? '',
    threadTitle: row.thread?.title ?? '',
  }));
}

export async function readForumMembers(limit = 30) {
  const supabase = ensureForumSupabase();
  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name, email, forum_points, forum_level, forum_title, created_at')
    .order('forum_points', { ascending: false })
    .limit(limit);

  if (error) {
    if (isMissingTableError(error.message)) return [];
    throw new Error('No se pudieron cargar miembros');
  }

  return (data ?? []).map((row) => ({
    ...mapAuthor(row),
    joinedAt: row.created_at,
  }));
}

export async function readPinnedThreads(limit = 10) {
  const supabase = ensureForumSupabase();
  const { data, error } = await supabase
    .from('forum_threads')
    .select(THREAD_SELECT)
    .eq('is_pinned', true)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    if (isMissingTableError(error.message)) return [];
    throw new Error('No se pudieron cargar novedades');
  }

  return (data ?? []).map((row) =>
    mapThread(row, row.category, row.author, row.last_reply_author),
  );
}
