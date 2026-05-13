import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

const SUPABASE_URL = 'https://hsaeklayssgqvkqecszv.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhzYWVrbGF5c3NncXZrcWVjc3p2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg1NjMyMDYsImV4cCI6MjA5NDEzOTIwNn0.ad6poslbhGsKJrWV53d12uqUoTQ3tmlXeryBy92euSs'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// --- Q&A Functions ---
export async function saveQnA(userId, date, answer) {
    const { data, error } = await supabase
        .from('daily_qna')
        .upsert({ user_id: userId, date: date, answer: answer }, { onConflict: 'user_id,date' })
    if (error) console.error('saveQnA error:', error);
    return data;
}

export async function getQnA(date) {
    const { data, error } = await supabase
        .from('daily_qna')
        .select('*')
        .eq('date', date)
    if (error) console.error('getQnA error:', error);
    return data || [];
}

// --- Marker Functions ---
export async function saveMarker(date, type) {
    if (type === 'none') {
        const { error } = await supabase.from('calendar_marker').delete().eq('date', date);
        if (error) console.error('deleteMarker error:', error);
    } else {
        const { error } = await supabase
            .from('calendar_marker')
            .upsert({ date: date, marker_type: type }, { onConflict: 'date' });
        if (error) console.error('saveMarker error:', error);
    }
}

export async function getMarkers() {
    const { data, error } = await supabase.from('calendar_marker').select('*');
    if (error) console.error('getMarkers error:', error);
    return data || [];
}

// --- Diary Functions ---
export async function saveDiary(userId, date, content) {
    const { data, error } = await supabase
        .from('diaries')
        .upsert({ user_id: userId, date: date, content: content }, { onConflict: 'user_id,date' });
    if (error) console.error('saveDiary error:', error);
    return data;
}

export async function getDiaries(date) {
    const { data, error } = await supabase
        .from('diaries')
        .select('*')
        .eq('date', date);
    if (error) console.error('getDiaries error:', error);
    return data || [];
}

// --- Photo Functions (Placeholder for URLs) ---
// Note: Actual file upload to Storage would require a separate flow. 
// For now, we'll manage the URLs in the photos table.
export async function savePhotoUrl(diaryId, userId, url) {
    const { data, error } = await supabase
        .from('photos')
        .insert([{ diary_id: diaryId, user_id: userId, storage_url: url }]);
    if (error) console.error('savePhotoUrl error:', error);
    return data;
}

export async function getPhotos(diaryId) {
    const { data, error } = await supabase
        .from('photos')
        .select('*')
        .eq('diary_id', diaryId);
    if (error) console.error('getPhotos error:', error);
    return data || [];
}
