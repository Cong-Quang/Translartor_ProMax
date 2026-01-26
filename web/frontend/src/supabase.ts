import { createClient } from '@supabase/supabase-js';
import { CONFIG } from './config';

const supabaseUrl = CONFIG.SUPABASE.URL;
const supabaseKey = CONFIG.SUPABASE.KEY;

// Kiểm tra xem đã có cấu hình chưa để tránh crash ứng dụng
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseKey);

// Nếu chưa có cấu hình, ta xuất ra một object rỗng hoặc handle lỗi thay vì crash
export const supabase = isSupabaseConfigured 
    ? createClient(supabaseUrl, supabaseKey)
    : (null as any); // Sẽ kiểm tra isSupabaseConfigured trước khi dùng

// Interface cho bảng 'rooms'
export interface Room {
    id: string; // Mã phòng (VD: 123-456-789)
    name: string;
    is_private: boolean;
    password?: string;
    enable_ai: boolean;
    created_at: string;
}