import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { Home, Settings, HelpCircle, Info, User, Video, LogOut, Menu } from 'lucide-react';
import { CONFIG } from '../config';
import { useState } from 'react';
import { useConfig } from '../context/ConfigContext';
import { useAuth } from '../context/AuthContext';

const NavbarItem = ({ to, icon: Icon, label }: { to: string, icon: any, label: string }) => (
    <NavLink
        to={to}
        className={({ isActive }) =>
            `flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 group ${isActive
                ? 'bg-primary/10 text-primary font-medium shadow-sm'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            }`
        }
    >
        <Icon className="w-4 h-4" />
        <span className="font-medium text-sm">{label}</span>
    </NavLink>
);

export const Layout = () => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const { t } = useConfig();
    const { user, signOut } = useAuth();
    const navigate = useNavigate();

    const handleSignOut = async () => {
        await signOut();
        navigate('/login');
    };

    return (
        <div className="flex flex-col h-screen bg-background text-foreground overflow-hidden">
            {/* Top Navbar */}
            <header className="h-16 border-b border-border bg-card flex items-center justify-between px-6 z-50 shrink-0 shadow-sm">
                {/* Logo Area */}
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-blue-500/20">
                        T
                    </div>
                    <div>
                        <h1 className="font-bold text-lg leading-tight tracking-tight">{CONFIG.APP.NAME}</h1>
                        <span className="text-[10px] text-muted-foreground font-bold bg-secondary px-1.5 py-0.5 rounded uppercase tracking-wider border border-border">v{CONFIG.APP.VERSION}</span>
                    </div>
                </div>

                {/* Desktop Navigation */}
                <nav className="hidden md:flex items-center gap-1 mx-6 bg-secondary/50 p-1 rounded-xl border border-border">
                    <NavbarItem to="/" icon={Home} label={t('home')} />
                    <NavbarItem to="/meeting-new" icon={Video} label={t('newMeeting')} />
                    <div className="w-px h-6 bg-border mx-2" />
                    <NavbarItem to="/settings" icon={Settings} label={t('settings')} />
                    <NavbarItem to="/guide" icon={HelpCircle} label={t('guide')} />
                    <NavbarItem to="/about" icon={Info} label={t('about')} />
                    <NavbarItem to="/profile" icon={User} label={t('profile')} />
                </nav>

                {/* Right Actions */}
                <div className="hidden md:flex items-center gap-3">
                    {user ? (
                        <>
                            <button
                                onClick={handleSignOut}
                                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                            >
                                <LogOut className="w-4 h-4" />
                                <span>{t('logout')}</span>
                            </button>
                            <div className="flex items-center gap-2 pl-2 border-l border-border">
                                <div className="text-right hidden lg:block">
                                    <p className="text-sm font-bold leading-none">{user.user_metadata?.full_name || 'User'}</p>
                                    <p className="text-[10px] text-muted-foreground">{user.email}</p>
                                </div>
                                <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 p-[2px] cursor-pointer hover:scale-105 transition-transform shadow-md">
                                    <div className="w-full h-full rounded-full bg-background flex items-center justify-center overflow-hidden">
                                        {user.user_metadata?.avatar_url ? (
                                            <img src={user.user_metadata.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="font-bold text-xs">{(user.user_metadata?.username || 'U').substring(0, 2).toUpperCase()}</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </>
                    ) : (
                        <NavLink
                            to="/login"
                            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-bold hover:opacity-90 transition-all shadow-lg shadow-primary/20"
                        >
                            {t('login')}
                        </NavLink>
                    )}
                </div>

                {/* Mobile Menu Button */}
                <button
                    className="md:hidden p-2 hover:bg-muted rounded-lg"
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                >
                    <Menu className="w-6 h-6" />
                </button>
            </header>

            {/* Mobile Menu Dropdown */}
            {isMobileMenuOpen && (
                <div className="md:hidden border-b border-border bg-card p-4 space-y-2 absolute top-16 left-0 right-0 z-40 shadow-xl animate-in slide-in-from-top-4 duration-200">
                    <NavbarItem to="/" icon={Home} label={t('home')} />
                    <NavbarItem to="/meeting-new" icon={Video} label={t('newMeeting')} />
                    <div className="h-px bg-border my-2" />
                    <NavbarItem to="/settings" icon={Settings} label={t('settings')} />
                    <NavbarItem to="/guide" icon={HelpCircle} label={t('guide')} />
                    <NavbarItem to="/about" icon={Info} label={t('about')} />
                    <NavbarItem to="/profile" icon={User} label={t('profile')} />
                    <div className="h-px bg-border my-2" />
                    <button className="flex w-full items-center gap-2 px-3 py-2 text-sm font-medium text-destructive hover:bg-destructive/10 rounded-lg transition-colors">
                        <LogOut className="w-4 h-4" />
                        <span>{t('logout')}</span>
                    </button>
                </div>
            )}

            {/* Main Content */}
            <main className="flex-1 overflow-auto relative p-6 bg-muted/20">
                <Outlet />
            </main>
        </div>
    );
};