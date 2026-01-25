
export const CONFIG = {
    APP: {
        NAME: "Translartor ProMax",
        VERSION: "1.0.0",
        DESCRIPTION: "Advanced Video Conference System",
    },
    SERVER: {
        BASE_URL: "http://xomnhala.ddns.net:3001",
        WS_URL: "ws://xomnhala.ddns.net:3001/ws",
        WEBRTC_HOST: "xomnhala.ddns.net",
        WEBRTC_PORT: 9000,
        WEBRTC_PATH: "/myapp",
    },
    ADMIN: {
        ID: "Admin@123",
        PASS: "12345678",
    },
    THEMES: {
        DARK: {
            name: "Tối",
            colors: {
                background: "222.2 84% 4.9%",
                primary: "210 40% 98%",
                accent: "217.2 32.6% 17.5%",
            }
        },
        LIGHT: {
            name: "Sáng",
            colors: {
                background: "0 0% 100%",
                primary: "222.2 47.4% 11.2%",
                accent: "210 40% 96.1%",
            }
        },
        BLUE: {
            name: "Xanh biển",
            colors: {
                background: "222 47% 11%",
                primary: "217 91% 60%",
                accent: "213 27% 24%",
            }
        }
    },
    LANGUAGES: [
        { code: "vi", name: "Tiếng Việt" },
        { code: "en", name: "English" }
    ]
};
