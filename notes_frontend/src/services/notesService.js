import { getSupabaseClient } from '../supabaseClient';

const STORAGE_KEY = 'notes_local_v1';

/**
 * Utility to generate a simple unique id when using local storage fallback.
 */
function uid() {
  return 'id-' + Math.random().toString(36).slice(2) + Date.now().toString(36);
}

/**
 * Normalize a note object to the app's expected shape.
 */
function normalizeNote(n) {
  if (!n) return null;
  return {
    id: n.id,
    title: n.title || 'Untitled',
    content: n.content || '',
    tags: Array.isArray(n.tags)
      ? n.tags.map(String)
      : typeof n.tags === 'string' && n.tags.length
        ? n.tags.split(',').map((t) => t.trim()).filter(Boolean)
        : [],
    created_at: n.created_at ? new Date(n.created_at).toISOString() : new Date().toISOString(),
    updated_at: n.updated_at ? new Date(n.updated_at).toISOString() : new Date().toISOString()
  };
}

/**
 * Read notes from localStorage
 */
function lsRead() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr.map(normalizeNote) : [];
  } catch {
    return [];
  }
}

/**
 * Write notes to localStorage
 */
function lsWrite(notes) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
  } catch {
    // ignore
  }
}

/**
 * Get filtered notes from an array based on term and tag
 */
function filterNotes(notes, term = '', tag = '') {
  const t = (term || '').toLowerCase().trim();
  const tg = (tag || '').toLowerCase().trim();
  return notes
    .filter((n) => {
      const matchesTerm =
        !t ||
        (n.title || '').toLowerCase().includes(t) ||
        (n.content || '').toLowerCase().includes(t);
      const matchesTag = !tg || (Array.isArray(n.tags) && n.tags.some((x) => x.toLowerCase() === tg));
      return matchesTerm && matchesTag;
    })
    .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
}

// PUBLIC_INTERFACE
export async function listNotes({ search = '', tag = '' } = {}) {
  /** List notes from Supabase (if configured) otherwise local storage. Supports filtering by search term and tag. */
  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      let query = supabase.from('notes').select().order('updated_at', { ascending: false });
      const t = (search || '').trim();
      if (t) {
        // Search in title or content using ilike
        query = query.or(`title.ilike.%${t}%,content.ilike.%${t}%`);
      }
      if (tag) {
        // Filter where tags array contains tag
        query = query.contains('tags', [tag]);
      }
      const { data, error } = await query;
      if (error) throw error;
      return (data || []).map(normalizeNote);
    } catch (err) {
      console.error('Supabase listNotes failed, using local storage. Error:', err);
      const local = lsRead();
      return filterNotes(local, search, tag);
    }
  }

  const local = lsRead();
  return filterNotes(local, search, tag);
}

// PUBLIC_INTERFACE
export async function createNote({ title = 'Untitled', content = '', tags = [] } = {}) {
  /** Create a new note. Persists to Supabase if configured; otherwise local storage. Returns created note. */
  const now = new Date().toISOString();
  const supabase = getSupabaseClient();

  if (supabase) {
    try {
      const payload = { title, content, tags, created_at: now, updated_at: now };
      const { data, error } = await supabase.from('notes').insert(payload).select().single();
      if (error) throw error;
      return normalizeNote(data);
    } catch (err) {
      console.error('Supabase createNote failed, using local storage. Error:', err);
      const notes = lsRead();
      const n = normalizeNote({ id: uid(), title, content, tags, created_at: now, updated_at: now });
      notes.unshift(n);
      lsWrite(notes);
      return n;
    }
  }

  const notes = lsRead();
  const n = normalizeNote({ id: uid(), title, content, tags, created_at: now, updated_at: now });
  notes.unshift(n);
  lsWrite(notes);
  return n;
}

// PUBLIC_INTERFACE
export async function updateNote(id, updates) {
  /** Update an existing note by id. Fields: title, content, tags. Returns updated note or null if not found. */
  const supabase = getSupabaseClient();
  const now = new Date().toISOString();
  const clean = {};
  if (typeof updates?.title === 'string') clean.title = updates.title;
  if (typeof updates?.content === 'string') clean.content = updates.content;
  if (Array.isArray(updates?.tags)) clean.tags = updates.tags;
  clean.updated_at = now;

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('notes')
        .update(clean)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return normalizeNote(data);
    } catch (err) {
      console.error('Supabase updateNote failed, using local storage. Error:', err);
      const notes = lsRead();
      const idx = notes.findIndex((n) => n.id === id);
      if (idx === -1) return null;
      const updated = normalizeNote({ ...notes[idx], ...clean });
      notes.splice(idx, 1, updated);
      lsWrite(notes);
      return updated;
    }
  }

  const notes = lsRead();
  const idx = notes.findIndex((n) => n.id === id);
  if (idx === -1) return null;
  const updated = normalizeNote({ ...notes[idx], ...clean });
  notes.splice(idx, 1, updated);
  lsWrite(notes);
  return updated;
}

/** 
 * Note: When Supabase is configured, we must not fall back to localStorage for deletes.
 * If the cloud delete fails, return false so the UI can show appropriate feedback.
 */
// PUBLIC_INTERFACE
export async function deleteNote(id) {
  /** Delete a note by id. Returns true on success. */
  const supabase = getSupabaseClient();

  if (supabase) {
    try {
      // Use .select().maybeSingle() so we can verify a row was actually deleted.
      const { data, error } = await supabase
        .from('notes')
        .delete()
        .eq('id', id)
        .select()
        .maybeSingle();

      if (error) {
        console.error('Supabase deleteNote error:', error);
        return false;
      }
      // If no row matched the id, data can be null. Treat as failure so UI can notify.
      return !!data;
    } catch (err) {
      console.error('Supabase deleteNote failed:', err);
      // Do not write to localStorage when Supabase is configured; it causes state divergence.
      return false;
    }
  }

  // Local storage fallback (only when Supabase is not configured)
  const notes = lsRead();
  const filtered = notes.filter((n) => n.id !== id);
  lsWrite(filtered);
  return true;
}

// PUBLIC_INTERFACE
export async function getAllTags() {
  /** Compute all tags from notes list. Returns array of unique tag strings sorted alphabetically. */
  const notes = await listNotes();
  const s = new Set();
  for (const n of notes) {
    (n.tags || []).forEach((t) => s.add(String(t)));
  }
  return Array.from(s).sort((a, b) => a.localeCompare(b));
}
