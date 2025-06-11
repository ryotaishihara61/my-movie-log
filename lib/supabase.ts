// lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

// .env.localからSupabaseのURLとキーを読み込む
// 後ろの「!」は、これらの変数がnullやundefinedではないことをTypeScriptに伝えるための記号です。
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Supabaseクライアントを作成してエクスポート
export const supabase = createClient(supabaseUrl, supabaseAnonKey)