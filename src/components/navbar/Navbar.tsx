import { useState, useRef, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, Heart, ShoppingBag, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useStore } from "@/store/StoreContext";
import { useTheme } from "@/components/theme-provider";
import { Sun, Moon } from "lucide-react";
import { fetchCategories, fetchSearchSuggestions } from "@/api/dummyjson";
import type { Category, SearchSuggestion } from "@/types";
import { cn } from "@/lib/utils";

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

export function Navbar() {
  const { cartCount, wishlist } = useStore();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);
  const [selectedSuggestionIdx, setSelectedSuggestionIdx] = useState(-1);
  const { recentSearches, addRecentSearch, clearRecentSearches } = useStore();
  const searchRef = useRef<HTMLDivElement>(null);
  const menuTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const debouncedQuery = useDebounce(searchQuery, 300);

  useEffect(() => {
    fetchCategories().then(setCategories);
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (debouncedQuery.length < 2) {
      setSuggestions([]);
      setSuggestionsLoading(false);
      return;
    }

    let cancelled = false;
    setSuggestionsLoading(true);

    fetchSearchSuggestions(debouncedQuery).then((results) => {
      if (!cancelled) {
        setSuggestions(results);
        setSuggestionsLoading(false);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [debouncedQuery]);

  const handleSearch = useCallback(
    (q: string) => {
      if (!q.trim()) return;
      addRecentSearch(q.trim());
      setShowSuggestions(false);
      setSearchQuery(q);
      navigate(`/products?search=${encodeURIComponent(q.trim())}`);
    },
    [addRecentSearch, navigate]
  );

  function handleSearchKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    const items = suggestions.length ? suggestions : [];
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedSuggestionIdx((i) => Math.min(i + 1, items.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedSuggestionIdx((i) => Math.max(i - 1, -1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (selectedSuggestionIdx >= 0 && items[selectedSuggestionIdx])
        handleSearch(items[selectedSuggestionIdx].text);
      else handleSearch(searchQuery);
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
      setSelectedSuggestionIdx(-1);
    }
  }

  function handleMenuEnter(catSlug: string) {
    if (menuTimeoutRef.current) clearTimeout(menuTimeoutRef.current);
    setActiveMenu(catSlug);
  }
  function handleMenuLeave() {
    menuTimeoutRef.current = setTimeout(() => setActiveMenu(null), 200);
  }

  const highlightMatch = (text: string, query: string) => {
    if (!query) return <span>{text}</span>;
    const idx = text.toLowerCase().indexOf(query.toLowerCase());
    if (idx < 0) return <span>{text}</span>;
    return (
      <span>
        {text.slice(0, idx)}
        <strong className="text-foreground font-semibold">
          {text.slice(idx, idx + query.length)}
        </strong>
        {text.slice(idx + query.length)}
      </span>
    );
  };

  return (
    <>
      <header className="sticky top-0 z-50 bg-background border-b border-border shadow-sm">
        <div className="max-w-[1440px] mx-auto px-3 lg:px-6 h-16 flex items-center gap-2">
          {" "}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? (
              <X className="size-5" />
            ) : (
              <Menu className="size-5" />
            )}
          </Button>
          <Link to="/" className="flex items-center shrink-0">
            <span className="text-2xl font-bold tracking-tighter">AJIO</span>
          </Link>
          <nav className="hidden lg:flex items-center gap-1 ml-2">
            <Link
              to="/products"
              className="px-3 py-2 text-sm font-medium rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            >
              All Products
            </Link>

            {categories.slice(0, 6).map((cat) => (
              <div
                key={cat.slug}
                className="relative"
                onMouseEnter={() => handleMenuEnter(cat.slug)}
                onMouseLeave={handleMenuLeave}
              >
                <Link
                  to={`/products?category=${cat.slug}`}
                  className={cn(
                    "px-3 py-2 text-sm font-medium rounded-md flex items-center gap-1 transition-colors",
                    activeMenu === cat.slug
                      ? "bg-brand-light text-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent"
                  )}
                >
                  {cat.name}
                </Link>
              </div>
            ))}
          </nav>
          <div ref={searchRef} className="flex-1 min-w-0 max-w-xl relative">
            {" "}
            <div className="relative flex items-center">
              <Search className="absolute left-3 size-4 text-muted-foreground pointer-events-none" />
              <input
                type="text"
                placeholder="Search for products..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowSuggestions(true);
                  setSelectedSuggestionIdx(-1);
                }}
                onFocus={() => setShowSuggestions(true)}
                onKeyDown={handleSearchKeyDown}
                className="w-full h-9 pl-9 pr-4 text-sm rounded-full border border-input bg-background focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setSuggestions([]);
                  }}
                  className="absolute right-3 text-muted-foreground hover:text-foreground"
                >
                  <X className="size-3.5" />
                </button>
              )}
            </div>
            {showSuggestions && (
              <div className="absolute top-full mt-1.5 w-full bg-popover border border-border rounded-xl shadow-lg z-50 overflow-hidden">
                {suggestionsLoading ? (
                  <div className="p-4 text-sm text-muted-foreground text-center">
                    Searching...
                  </div>
                ) : searchQuery.length >= 2 ? (
                  suggestions.length > 0 ? (
                    <ul>
                      {suggestions.map((s, i) => (
                        <li key={s.id ?? i}>
                          <button
                            onClick={() => handleSearch(s.text)}
                            className={cn(
                              "w-full text-left px-4 py-2.5 text-sm flex items-center gap-3 hover:bg-accent transition-colors",
                              i === selectedSuggestionIdx && "bg-accent"
                            )}
                          >
                            {s.image && (
                              <img
                                src={s.image}
                                alt=""
                                className="size-8 rounded object-cover shrink-0"
                              />
                            )}
                            <span className="text-muted-foreground">
                              {highlightMatch(s.text, searchQuery)}
                            </span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="p-4 text-sm text-muted-foreground text-center">
                      No suggestions found
                    </div>
                  )
                ) : (
                  <div>
                    {recentSearches.length > 0 && (
                      <div>
                        <div className="flex items-center justify-between px-4 pt-3 pb-1">
                          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            Recent
                          </span>
                          <button
                            onClick={clearRecentSearches}
                            className="text-xs text-brand hover:underline"
                          >
                            Clear
                          </button>
                        </div>
                        {recentSearches.map((s, i) => (
                          <button
                            key={i}
                            onClick={() => handleSearch(s)}
                            className="w-full text-left px-4 py-2 text-sm flex items-center gap-3 hover:bg-accent transition-colors"
                          >
                            <Search className="size-3.5 text-muted-foreground shrink-0" />
                            <span>{s}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <Link
              to="/orders"
              className="hidden md:block px-3 py-2 text-sm font-medium rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            >
              My Orders
            </Link>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              {theme === "dark" ? (
                <Sun className="size-4" />
              ) : (
                <Moon className="size-4" />
              )}
            </Button>
            <Link to="/wishlist">
              <Button variant="ghost" size="icon" className="relative">
                <Heart className="size-4" />
                {wishlist.length > 0 && (
                  <Badge className="absolute -top-1 -right-1 size-4 p-0 flex items-center justify-center text-[10px] bg-brand text-brand-foreground border-0">
                    {wishlist.length > 9 ? "9+" : wishlist.length}
                  </Badge>
                )}
              </Button>
            </Link>
            <Link to="/cart">
              <Button variant="ghost" size="icon" className="relative">
                <ShoppingBag className="size-4" />
                {cartCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 size-4 p-0 flex items-center justify-center text-[10px] bg-brand text-brand-foreground border-0">
                    {cartCount > 9 ? "9+" : cartCount}
                  </Badge>
                )}
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute left-0 top-0 bottom-0 w-80 bg-background overflow-y-auto shadow-xl">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <span className="text-xl font-black text-brand">AJIO</span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileOpen(false)}
              >
                <X className="size-5" />
              </Button>
            </div>
            <nav className="p-4 space-y-1">
              <Link
                to="/products"
                onClick={() => setMobileOpen(false)}
                className="block px-3 py-3 text-sm font-medium rounded-lg hover:bg-accent transition-colors"
              >
                All Products
              </Link>
              <Link
                to="/orders"
                onClick={() => setMobileOpen(false)}
                className="block px-3 py-3 text-sm font-medium rounded-lg hover:bg-accent transition-colors"
              >
                My Orders
              </Link>
              {categories.map((cat) => (
                <Link
                  key={cat.slug}
                  to={`/products?category=${cat.slug}`}
                  onClick={() => setMobileOpen(false)}
                  className="block px-3 py-3 text-sm font-medium rounded-lg hover:bg-accent hover:text-brand transition-colors"
                >
                  {cat.name}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      )}
    </>
  );
}
