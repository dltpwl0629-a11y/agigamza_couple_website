import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

// Supabase configuration
const SUPABASE_URL = 'https://hsaeklayssgqvkqecszv.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhzYWVrbGF5c3NncXZrcWVjc3p2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg1NjMyMDYsImV4cCI6MjA5NDEzOTIwNn0.ad6poslbhGsKJrWV53d12uqUoTQ3tmlXeryBy92euSs'

// Initialize Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

/**
 * Adds a new record to the 'diaries' table.
 * @param {string} content - The content to be recorded.
 * @param {string} date - The date of the record (YYYY-MM-DD).
 * @param {string} userId - The UUID of the user from the 'profiles' table.
 */
export async function addRecord(content, date, userId) {
    try {
        const { data, error } = await supabase
            .from('diaries')
            .insert([{ 
                content: content, 
                date: date, 
                user_id: userId // Schema requires user_id (FK to profiles)
            }])

        if (error) throw error
        return data
    } catch (error) {
        console.error('Error in addRecord:', error.message)
        return null
    }
}

/**
 * Retrieves all records from the 'diaries' table.
 * @returns {Promise<Array>} Array of diary entries.
 */
export async function getRecords() {
    try {
        const { data, error } = await supabase
            .from('diaries')
            .select('*')
            .order('date', { ascending: false })

        if (error) throw error
        return data
    } catch (error) {
        console.error('Error in getRecords:', error.message)
        return []
    }
}
