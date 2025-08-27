/**
 * Notes data-access layer using Supabase.
 * Provides CRUD operations for the "notes" table.
 *
 * Table schema expected:
 * - id: uuid (primary key, default uuid_generate_v4())
 * - title: text
 * - content: text
 * - created_at: timestamp with time zone, default now()
 * - updated_at: timestamp with time zone, default now()
 *
 * Index suggestion (create on DB side):
 * - index on (title)
 * - index on (updated_at desc)
 */

import supabase from '../supabaseClient';

/**
 * PUBLIC_INTERFACE
 * listNotes
 * Fetches notes ordered by updated_at desc.
 */
export async function listNotes() {
  /** Returns an array of notes with id, title, content, created_at, updated_at. */
  const { data, error } = await supabase
    .from('notes')
    .select('id, title, content, created_at, updated_at')
    .order('updated_at', { ascending: false });

  if (error) {
    throw new Error(error.message || 'Failed to list notes');
  }
  return data || [];
}

/**
 * PUBLIC_INTERFACE
 * searchNotes
 * Searches notes by title or content using ilike.
 */
export async function searchNotes(query) {
  /** Returns notes that match the case-insensitive query on title or content. */
  if (!query || !query.trim()) {
    return listNotes();
  }

  const like = `%${query.trim()}%`;
  const { data, error } = await supabase
    .from('notes')
    .select('id, title, content, created_at, updated_at')
    .or(`title.ilike.${like},content.ilike.${like}`)
    .order('updated_at', { ascending: false });

  if (error) {
    throw new Error(error.message || 'Failed to search notes');
  }
  return data || [];
}

/**
 * PUBLIC_INTERFACE
 * createNote
 * Creates a new note with title and optional content.
 */
export async function createNote({ title, content = '' }) {
  /** Returns the created note row. */
  const payload = {
    title: title?.trim() || 'Untitled',
    content,
    updated_at: new Date().toISOString(),
  };
  const { data, error } = await supabase.from('notes').insert(payload).select().single();

  if (error) {
    throw new Error(error.message || 'Failed to create note');
  }
  return data;
}

/**
 * PUBLIC_INTERFACE
 * updateNote
 * Updates an existing note by id.
 */
export async function updateNote(id, { title, content }) {
  /** Returns the updated note row. */
  const payload = {
    ...(typeof title === 'string' ? { title } : {}),
    ...(typeof content === 'string' ? { content } : {}),
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from('notes')
    .update(payload)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(error.message || 'Failed to update note');
  }
  return data;
}

/**
 * PUBLIC_INTERFACE
 * deleteNote
 * Deletes a note by id.
 */
export async function deleteNote(id) {
  /** Returns true if deletion succeeded. */
  const { error } = await supabase.from('notes').delete().eq('id', id);
  if (error) {
    throw new Error(error.message || 'Failed to delete note');
  }
  return true;
}
