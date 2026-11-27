'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import { Search, Menu, X, LogIn, LogOut, Settings, Trophy, Info, PenSquare } from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';
import { CATEGORIES } from '@/lib/article-utils';

interface HeaderProps {
  onSearch?: (q: string) => void;
  onCategoryChange?: (c: string) => void;
  activeCategory?: string;
  searchValue?: string;
}

export default function Header({
  onSearch,
  onCategoryChange,
  activeCategory,
  searchValue = '',
}: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState(searchValue);
  const { data: session } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    setSearchQuery(searchValue);
  }, [searchValue]);

  const handleSearchInput = (q: string) => {
    setSearchQuery(q);
    if (onSearch) {
      onSearch(q);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = searchQuery.trim();
    if (onSearch) {
      onSearch(trimmed);
    } else if (trimmed) {
      router.push(`/?search=${encodeURIComponent(trimmed)}`);
    } else {
      router.push('/');
    }
    setSearchOpen(false);
  };

  const handleCategoryClick = (cat: string) => {
    setMenuOpen(false);
    if (onCategoryChange && pathname === '/') {
      onCategoryChange(cat);
      const section = document.getElementById('articles-section');
      if (section) {
        section.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    } else {
      router.push(`/?category=${encodeURIComponent(cat)}`);
    }
  };

  const handleLogoClick = () => {
    if (onCategoryChange && pathname === '/') {
      onCategoryChange('すべて');
    }
    if (onSearch && pathname === '/') {
      onSearch('');
      setSearchQuery('');
    }
  };

  const isAdmin = (session?.user as { role?: string } | undefined)?.role === 'admin';

  return (
    <header className="sticky top-0 z-50 bg-background/85 backdrop-blur-md border-b border-border/80">
      <div className="max-w-[1200px] mx-auto px-4 h-16 flex items-center justify-between gap-3">
        {/* Brand Logo */}
        <Link href="/" onClick={handleLogoClick} className="flex items-center gap-2.5 shrink-0 group">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/favicon.svg"
            alt="GadgetPress ロゴ"
            className="w-8 h-8 rounded-lg shadow-sm transition-transform duration-fast group-hover:scale-105"
          />
          <div className="flex flex-col">
            <span className="font-display text-lg font-bold tracking-tight leading-none text-foreground">
              Gadget<span className="text-[#00b4d8] dark:text-[#00d4ff]">Press</span>
            </span>
            <span className="text-[10px] font-mono tracking-wider text-muted-foreground uppercase hidden sm:block mt-0.5">
              Tech Review Media
            </span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-0.5 shrink-0">
          {CATEGORIES.map((cat) => {
            const isActive = pathname === '/' && activeCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => handleCategoryClick(cat)}
                className={`px-2 py-1.5 text-[13px] font-medium rounded-md whitespace-nowrap transition-colors duration-fast ${
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-foreground/80 hover:text-foreground hover:bg-muted'
                }`}
              >
                {cat}
              </button>
            );
          })}
          <span className="h-4 w-px bg-border mx-1" />
          <Link
            href="/ranking"
            className={`px-2 py-1.5 text-[13px] font-medium rounded-md whitespace-nowrap transition-colors duration-fast flex items-center gap-1 ${
              pathname === '/ranking'
                ? 'bg-primary text-primary-foreground'
                : 'text-foreground/80 hover:text-foreground hover:bg-muted'
            }`}
          >
            <Trophy className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            ランキング
          </Link>
          <Link
            href="/about"
            className={`px-2 py-1.5 text-[13px] font-medium rounded-md whitespace-nowrap transition-colors duration-fast ${
              pathname === '/about'
                ? 'bg-primary text-primary-foreground'
                : 'text-foreground/80 hover:text-foreground hover:bg-muted'
            }`}
          >
            編集方針
          </Link>
        </nav>

        {/* Desktop Right Side */}
        <div className="hidden md:flex items-center gap-1.5 shrink-0">
          <form onSubmit={handleSearchSubmit} className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
            <input
              type="text"
              placeholder="記事を検索..."
              aria-label="記事を検索"
              value={searchQuery}
              onChange={(e) => handleSearchInput(e.target.value)}
              className="pl-8 pr-2.5 py-1.5 w-32 xl:w-40 text-sm bg-muted/80 rounded-md border border-transparent focus:border-ring focus:bg-background focus:outline-none focus:ring-2 focus:ring-ring/30 placeholder:text-muted-foreground transition-all"
            />
          </form>

          <ThemeToggle />

          {session?.user ? (
            <div className="flex items-center gap-1.5 shrink-0">
              {isAdmin && (
                <>
                  <Link
                    href="/admin/articles/new"
                    className="flex items-center gap-1 px-2.5 py-1.5 text-[13px] font-semibold rounded-md whitespace-nowrap bg-[#00d4ff] text-[#0a1628] hover:bg-[#33ddff] transition-colors"
                  >
                    <PenSquare className="w-3.5 h-3.5 shrink-0" />
                    投稿
                  </Link>
                  <Link
                    href="/admin"
                    className="flex items-center gap-1 px-2.5 py-1.5 text-[13px] font-medium rounded-md whitespace-nowrap bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
                    title="管理コンソール"
                  >
                    <Settings className="w-3.5 h-3.5 shrink-0" />
                    管理
                  </Link>
                </>
              )}
              <div
                className="hidden xl:flex items-center gap-1.5 pl-1 pr-2 py-0.5 rounded-full bg-muted/70 border border-border/60 max-w-[120px]"
                title={session.user.email || session.user.name || 'ログイン中'}
              >
                {session.user.image ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={session.user.image}
                    alt={`${session.user.name || 'ユーザー'}のプロフィール画像`}
                    className="w-6 h-6 rounded-full object-cover shrink-0"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center shrink-0">
                    {(session.user.name || session.user.email || 'U').slice(0, 1).toUpperCase()}
                  </span>
                )}
                <span className="text-xs font-medium truncate">
                  {session.user.name || session.user.email}
                </span>
              </div>
              <button
                type="button"
                onClick={() => signOut({ redirectTo: '/' })}
                className="flex items-center gap-1 p-2 text-[13px] font-medium rounded-md whitespace-nowrap hover:bg-muted transition-colors text-foreground/80"
                title="ログアウト"
                aria-label="ログアウト"
              >
                <LogOut className="w-4 h-4 shrink-0" />
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="flex items-center gap-1.5 px-3 py-1.5 text-[13px] font-medium rounded-md whitespace-nowrap bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
            >
              <LogIn className="w-4 h-4 shrink-0" />
              ログイン
            </Link>
          )}
        </div>

        {/* Mobile & Tablet Buttons */}
        <div className="flex lg:hidden items-center gap-1 shrink-0">
          {isAdmin && (
            <Link
              href="/admin/articles/new"
              aria-label="新規記事を投稿"
              className="md:hidden inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold rounded-md bg-[#00d4ff] text-[#0a1628]"
            >
              <PenSquare className="w-3.5 h-3.5" />
              投稿
            </Link>
          )}
          <div className="md:hidden">
            <ThemeToggle />
          </div>
          <button
            type="button"
            onClick={() => setSearchOpen(!searchOpen)}
            aria-label="検索を開く"
            className="md:hidden p-2 rounded-md hover:bg-muted transition-colors"
          >
            <Search className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="メニューを開く"
            className="p-2 rounded-md hover:bg-muted transition-colors"
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Search */}
      {searchOpen && (
        <div className="md:hidden px-4 pb-3 border-t border-border/50 pt-2.5 bg-background">
          <form onSubmit={handleSearchSubmit} className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="製品名・キーワードで検索..."
              value={searchQuery}
              onChange={(e) => handleSearchInput(e.target.value)}
              className="pl-9 pr-4 py-2 w-full text-sm bg-muted rounded-md border-0 focus:outline-none focus:ring-2 focus:ring-ring"
              autoFocus
            />
          </form>
        </div>
      )}

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="lg:hidden border-t border-border bg-background shadow-lg">
          <nav className="px-4 py-3 space-y-1">
            <p className="px-3 py-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              カテゴリ
            </p>
            <div className="grid grid-cols-2 gap-1">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => handleCategoryClick(cat)}
                  className={`text-left px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    pathname === '/' && activeCategory === cat
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-muted'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
            <div className="pt-2 mt-2 border-t border-border space-y-1">
              <Link
                href="/ranking"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md hover:bg-muted"
              >
                <Trophy className="w-4 h-4 text-amber-500" />
                スコアランキング・スペック比較
              </Link>
              <Link
                href="/about"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md hover:bg-muted"
              >
                <Info className="w-4 h-4 text-[#00b4d8]" />
                GadgetPressについて・編集方針
              </Link>
            </div>
            <div className="pt-2 mt-2 border-t border-border">
              {session?.user ? (
                <>
                  <div className="flex items-center gap-2.5 px-3 py-2 mb-1">
                    {session.user.image ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={session.user.image}
                        alt={`${session.user.name || 'ユーザー'}のプロフィール画像`}
                        className="w-7 h-7 rounded-full object-cover shrink-0"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <span className="w-7 h-7 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center shrink-0">
                        {(session.user.name || session.user.email || 'U').slice(0, 1).toUpperCase()}
                      </span>
                    )}
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">
                        {session.user.name || 'ユーザー'}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">{session.user.email}</p>
                    </div>
                  </div>
                  {isAdmin && (
                    <>
                      <Link
                        href="/admin/articles/new"
                        className="flex items-center gap-2 px-3 py-2 text-sm font-semibold rounded-md text-[#0077b6] dark:text-[#00d4ff] hover:bg-muted"
                        onClick={() => setMenuOpen(false)}
                      >
                        <PenSquare className="w-4 h-4" />
                        新規記事を投稿
                      </Link>
                      <Link
                        href="/admin"
                        className="flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md hover:bg-muted"
                        onClick={() => setMenuOpen(false)}
                      >
                        <Settings className="w-4 h-4" />
                        管理コンソール
                      </Link>
                    </>
                  )}
                  <button
                    type="button"
                    onClick={() => signOut({ redirectTo: '/' })}
                    className="flex items-center gap-2 w-full text-left px-3 py-2 text-sm font-medium rounded-md hover:bg-muted"
                  >
                    <LogOut className="w-4 h-4" />
                    ログアウト
                  </button>
                </>
              ) : (
                <Link
                  href="/login"
                  className="flex items-center justify-center gap-2 px-3 py-2.5 text-sm font-medium rounded-md bg-primary text-primary-foreground"
                  onClick={() => setMenuOpen(false)}
                >
                  <LogIn className="w-4 h-4" />
                  ログイン
                </Link>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
