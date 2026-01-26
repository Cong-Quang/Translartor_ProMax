
export const translations = {
    vi: {
        // Common
        home: "Trang chủ",
        newMeeting: "Cuộc họp mới",
        settings: "Cài đặt",
        guide: "Hướng dẫn",
        about: "Giới thiệu",
        profile: "Thông tin",
        logout: "Thoát",
        cancel: "Hủy",
        save: "Lưu",
        back: "Quay lại",
        developing: "Đang được phát triển...",

        // Home
        heroTitle: "Kết nối không giới hạn",
        heroDesc: "Nền tảng họp trực tuyến bảo mật, chất lượng cao với khả năng dịch thuật thời gian thực.",
        join: "Tham gia",
        joinDesc: "Nhập mã phòng hoặc liên kết để tham gia cuộc họp đang diễn ra.",
        newMeetingDesc: "Tạo phòng họp ngay lập tức và mời mọi người tham gia.",
        schedule: "Lên lịch",
        scheduleDesc: "Lên kế hoạch cho các cuộc họp trong tương lai.",

        // Settings
        systemSettings: "Cài đặt hệ thống",
        settingsDesc: "Tùy chỉnh trải nghiệm theo cách của bạn.",
        general: "Chung",
        appearance: "Giao diện",
        network: "Máy chủ",
        admin: "Quản trị",
        displayLanguage: "Ngôn ngữ hiển thị",
        displayMode: "Chế độ hiển thị",
        themeDark: "Tối",
        themeLight: "Sáng",
        themeSystem: "Hệ thống",
        themeBlue: "Xanh biển",
        wallpaper: "Hình nền",
        wallpaperDesc: "Tính năng đổi hình nền tùy chỉnh đang được phát triển...",
        connectionConfig: "Cấu hình kết nối",
        apiUrl: "Địa chỉ API Server",
        networkWarning: "Lưu ý: Thay đổi địa chỉ máy chủ có thể làm gián đoạn kết nối hiện tại.",
        adminAccount: "Tài khoản Quản trị",
        administrator: "Quản trị viên",
        password: "Mật khẩu",
        changePassword: "Đổi mật khẩu bảo mật",
    },
    en: {
        // Common
        home: "Home",
        newMeeting: "New Meeting",
        settings: "Settings",
        guide: "Guide",
        about: "About",
        profile: "Profile",
        logout: "Logout",
        cancel: "Cancel",
        save: "Save",
        back: "Back",
        developing: "Under development...",

        // Home
        heroTitle: "Unlimited Connectivity",
        heroDesc: "Secure, high-quality video conference platform with real-time translation.",
        join: "Join",
        joinDesc: "Enter room code or link to join an ongoing meeting.",
        newMeetingDesc: "Create a meeting room instantly and invite others.",
        schedule: "Schedule",
        scheduleDesc: "Plan meetings for the future.",

        // Settings
        systemSettings: "System Settings",
        settingsDesc: "Customize your experience your way.",
        general: "General",
        appearance: "Appearance",
        network: "Server",
        admin: "Admin",
        displayLanguage: "Display Language",
        displayMode: "Display Mode",
        themeDark: "Dark",
        themeLight: "Light",
        themeSystem: "System",
        themeBlue: "Ocean Blue",
        wallpaper: "Wallpaper",
        wallpaperDesc: "Custom wallpaper feature is under development...",
        connectionConfig: "Connection Config",
        apiUrl: "API Server Address",
        networkWarning: "Note: Changing the server address may disrupt the current connection.",
        adminAccount: "Admin Account",
        administrator: "Administrator",
        password: "Password",
        changePassword: "Change Security Password",
    }
};

export type Language = keyof typeof translations;
export type TranslationKeys = keyof typeof translations['en'];
