
import { Outlet, NavLink } from 'react-router-dom';
import { Home, Settings, HelpCircle, Info, User, Video, LogOut, Menu } from 'lucide-react';
import { CONFIG } from '../config';
import { useState } from 'react';

const NavbarItem = ({ to, icon: Icon, label }: { to: string, icon: any, label: string }) => (
    <NavLink
        to={to}
        className={({ isActive }) =>
            `flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 group ${isActive
                ? 'bg-primary/10 text-primary font-medium shadow-sm'
                : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
            }`
        }
    >
        <Icon className="w-4 h-4" />
        <span className="font-medium text-sm">{label}</span>
    </NavLink>
);

export const Layout = () => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    return (
        <div className="flex flex-col h-screen bg-background text-foreground overflow-hidden">
            {/* Top Navbar */}
            <header className="h-16 border-b border-border bg-card flex items-center justify-between px-6 z-50 shrink-0">
                {/* Logo Area */}
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-blue-500/20">
                        T
                    </div>
                    <div>
                        <h1 className="font-bold text-lg leading-tight tracking-tight">{CONFIG.APP.NAME}</h1>
                        <span className="text-[10px] text-muted-foreground font-bold bg-secondary/50 px-1.5 py-0.5 rounded uppercase tracking-wider">v{CONFIG.APP.VERSION}</span>
                    </div>
                </div>

                {/* Desktop Navigation */}
                <nav className="hidden md:flex items-center gap-1 mx-6 bg-secondary/20 p-1 rounded-xl border border-white/5">
                    <NavbarItem to="/" icon={Home} label="Trang chủ" />
                    <NavbarItem to="/meeting-new" icon={Video} label="Cuộc họp mới" />
                    <div className="w-px h-6 bg-border mx-2" />
                    <NavbarItem to="/settings" icon={Settings} label="Cài đặt" />
                    <NavbarItem to="/guide" icon={HelpCircle} label="Hướng dẫn" />
                    <NavbarItem to="/about" icon={Info} label="Giới thiệu" />
                    <NavbarItem to="/profile" icon={User} label="Thông tin" />
                </nav>

                {/* Right Actions */}
                <div className="hidden md:flex items-center gap-3">
                    <button className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-destructive hover:bg-destructive/10 rounded-lg transition-colors">
                        <LogOut className="w-4 h-4" />
                        <span>Thoát</span>
                    </button>
                    <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 p-[2px] cursor-pointer hover:scale-105 transition-transform">
                        <div className="w-full h-full rounded-full bg-background flex items-center justify-center">
                            <span className="font-bold text-xs">AD</span>
                        </div>
                    </div>
                </div>

                {/* Mobile Menu Button */}
                <button
                    className="md:hidden p-2 hover:bg-muted rounded-lg"
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                >
                    <Menu className="w-6 h-6" />
                </button>
            </header>

            {/* Mobile Menu Dropdown (Simple implementation) */}
            {isMobileMenuOpen && (
                <div className="md:hidden border-b border-border bg-card p-4 space-y-2 absolute top-16 left-0 right-0 z-40 shadow-xl">
                    <NavbarItem to="/" icon={Home} label="Trang chủ" />
                    <NavbarItem to="/meeting-new" icon={Video} label="Cuộc họp mới" />
                    <div className="h-px bg-border my-2" />
                    <NavbarItem to="/settings" icon={Settings} label="Cài đặt" />
                    <NavbarItem to="/guide" icon={HelpCircle} label="Hướng dẫn" />
                    <NavbarItem to="/about" icon={Info} label="Giới thiệu" />
                    <NavbarItem to="/profile" icon={User} label="Thông tin" />
                    <div className="h-px bg-border my-2" />
                    <button className="flex w-full items-center gap-2 px-3 py-2 text-sm font-medium text-destructive hover:bg-destructive/10 rounded-lg transition-colors">
                        <LogOut className="w-4 h-4" />
                        <span>Đăng xuất</span>
                    </button>
                </div>
            )}

            {/* Main Content */}
            <main className="flex-1 overflow-auto relative p-6">
                <Outlet />
            </main>
        </div>
    );
};
