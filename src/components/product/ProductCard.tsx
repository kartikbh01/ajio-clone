import { useState } from "react";
import { Link } from "react-router-dom";
import { Heart, Star, ShoppingBag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useStore } from "@/store/StoreContext";
import { cn } from "@/lib/utils";
import { formatPrice } from "@/lib/formatPrice";
import type { Product } from "@/types";
import { toast } from "sonner";

interface ProductCardProps {
  product: Product;
  view?: "grid" | "list";
}

export function ProductCard({ product, view = "grid" }: ProductCardProps) {
  const { toggleWishlist, isWishlisted, addToCart } = useStore();
  const [imgLoaded, setImgLoaded] = useState(false);
  const wishlisted = isWishlisted(product.id);

  function handleWishlist(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product.id);
    toast(wishlisted ? "Removed from wishlist" : "Added to wishlist", {
      description: product.name,
      duration: 2000,
    });
  }

  function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!product.inStock) {
      toast.error("Product is out of stock", { duration: 2000 });
      return;
    }
    addToCart(product);
    toast.success("Added to bag!", {
      description: product.name,
      duration: 2000,
    });
  }

  if (view === "list") {
    return (
      <Link
        to={`/product/${product.id}`}
        className="group relative flex bg-card rounded-xl overflow-hidden border border-border hover:shadow-lg hover:border-brand/10 dark:hover:border-primary/20 transition-all duration-300 w-full"
      >
        {/* Left Side: Image */}
        <div className="relative w-36 sm:w-48 aspect-[4/5] shrink-0 overflow-hidden bg-muted">
          {!imgLoaded && <Skeleton className="absolute inset-0 rounded-none" />}
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            onLoad={() => setImgLoaded(true)}
            className={cn(
              "w-full h-full object-cover transition-transform duration-500 group-hover:scale-105",
              !imgLoaded && "opacity-0"
            )}
          />

          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {product.discount >= 1 && (
              <Badge className="bg-brand text-brand-foreground text-[10px] px-1.5 py-0.5 font-bold border-0">
                {product.discount}% OFF
              </Badge>
            )}
            {!product.inStock && (
              <Badge
                variant="secondary"
                className="text-[10px] px-1.5 py-0.5 font-bold"
              >
                OUT OF STOCK
              </Badge>
            )}
          </div>

          <button
            onClick={handleWishlist}
            className={cn(
              "absolute top-2 right-2 size-7 rounded-full flex items-center justify-center transition-all duration-200 shadow-sm z-10",
              wishlisted
                ? "bg-brand text-brand-foreground scale-110"
                : "bg-card/95 text-foreground border border-border hover:bg-brand hover:text-brand-foreground hover:scale-110"
            )}
          >
            <Heart className={cn("size-3.5", wishlisted && "fill-current")} />
          </button>
        </div>

        {/* Right Side: Content */}
        <div className="p-3 sm:p-4 flex flex-col justify-between flex-1 min-w-0">
          <div>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider truncate">
              {product.brand}
            </p>
            <p className="text-sm sm:text-base font-semibold text-foreground mt-0.5 line-clamp-2 leading-snug">
              {product.name}
            </p>

            <div className="flex items-center gap-1.5 mt-1.5">
              <div className="flex items-center gap-0.5 bg-emerald-800 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-sm">
                <span>{product.rating.toFixed(1)}</span>
                <Star className="size-2.5 fill-current" />
              </div>
              {product.reviewCount > 0 && (
                <span className="text-[11px] text-muted-foreground">
                  ({product.reviewCount})
                </span>
              )}
            </div>

            {product.description && (
              <p className="text-xs text-muted-foreground line-clamp-2 mt-2 hidden sm:block">
                {product.description}
              </p>
            )}
          </div>

          <div className="flex items-center justify-between gap-4 mt-3 sm:mt-4 pt-2 sm:pt-3 border-t border-border/50">
            <div className="flex items-baseline gap-1.5 flex-wrap">
              <span className="text-base font-bold text-foreground">
                {formatPrice(product.price)}
              </span>
              {product.originalPrice > product.price && (
                <span className="text-xs text-muted-foreground line-through">
                  {formatPrice(product.originalPrice)}
                </span>
              )}
            </div>
            <Button
              onClick={handleAddToCart}
              disabled={!product.inStock}
              size="sm"
              className="h-8 sm:h-9 px-2.5 sm:px-3 rounded-md bg-brand hover:bg-brand/90 text-brand-foreground shrink-0 transition-transform duration-200 hover:scale-102 flex items-center gap-1.5"
            >
              <ShoppingBag className="size-3.5" />
              <span className="text-xs font-semibold hidden sm:inline">
                {product.inStock ? "Add to Bag" : "Out of Stock"}
              </span>
            </Button>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link
      to={`/product/${product.id}`}
      className="group relative block bg-card rounded-xl overflow-hidden border border-border hover:shadow-lg hover:border-brand/10 dark:hover:border-primary/20 transition-all duration-300"
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-muted">
        {!imgLoaded && <Skeleton className="absolute inset-0 rounded-none" />}
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          onLoad={() => setImgLoaded(true)}
          className={cn(
            "w-full h-full object-cover transition-transform duration-500 group-hover:scale-105",
            !imgLoaded && "opacity-0"
          )}
        />

        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {product.discount >= 1 && (
            <Badge className="bg-brand text-brand-foreground text-[10px] px-1.5 py-0.5 font-bold border-0">
              {product.discount}% OFF
            </Badge>
          )}
          {!product.inStock && (
            <Badge
              variant="secondary"
              className="text-[10px] px-1.5 py-0.5 font-bold"
            >
              OUT OF STOCK
            </Badge>
          )}
        </div>

        <button
          onClick={handleWishlist}
          className={cn(
            "absolute top-2 right-2 size-7 rounded-full flex items-center justify-center transition-all duration-200 shadow-sm",
            wishlisted
              ? "bg-brand text-brand-foreground scale-110"
              : "bg-card/95 text-foreground border border-border hover:bg-brand hover:text-brand-foreground hover:scale-110"
          )}
        >
          <Heart className={cn("size-3.5", wishlisted && "fill-current")} />
        </button>

      </div>

      <div className="p-3 flex flex-col h-full">
        <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider truncate">
          {product.brand}
        </p>
        <p className="text-sm font-medium text-foreground mt-0.5 line-clamp-2 leading-snug">
          {product.name}
        </p>

        <div className="flex items-center gap-1.5 mt-1.5">
          <div className="flex items-center gap-0.5 bg-emerald-800 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-sm">
            <span>{product.rating.toFixed(1)}</span>
            <Star className="size-2.5 fill-current" />
          </div>
          {product.reviewCount > 0 && (
            <span className="text-[11px] text-muted-foreground">
              ({product.reviewCount})
            </span>
          )}
        </div>

        <div className="flex items-center justify-between gap-2 mt-2.5">
          <div className="flex items-baseline gap-1.5 flex-wrap">
            <span className="text-sm font-bold text-foreground">
              {formatPrice(product.price)}
            </span>
            {product.originalPrice > product.price && (
              <span className="text-xs text-muted-foreground line-through">
                {formatPrice(product.originalPrice)}
              </span>
            )}
          </div>
          <Button
            onClick={handleAddToCart}
            disabled={!product.inStock}
            size="sm"
            className="h-8 px-2 rounded-md bg-brand hover:bg-brand/90 text-brand-foreground shrink-0 transition-transform duration-200 hover:scale-102 flex items-center gap-1.5"
          >
            <ShoppingBag className="size-3.5" />
          </Button>
        </div>
      </div>
    </Link>
  );
}

export function ProductCardSkeleton({ view = "grid" }: { view?: "grid" | "list" }) {
  if (view === "list") {
    return (
      <div className="flex bg-card rounded-xl overflow-hidden border border-border w-full">
        <Skeleton className="w-36 sm:w-48 aspect-[4/5] rounded-none shrink-0" />
        <div className="p-3 sm:p-4 flex flex-col justify-between flex-1 space-y-3">
          <div className="space-y-2">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-3.5 w-full hidden sm:block" />
          </div>
          <div className="flex items-center justify-between gap-4 pt-2 sm:pt-3 border-t border-border/50">
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-8 sm:h-9 w-10 sm:w-28" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl overflow-hidden border border-border">
      <Skeleton className="aspect-[4/5] rounded-none" />
      <div className="p-3 space-y-2">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-4 w-20" />
      </div>
    </div>
  );
}
