import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { MapPin, Phone, Mail } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { fetchCategories } from "@/api/dummyjson"
import type { Category } from "@/types"

const staticLinks = [
  {
    title: "Company",
    links: [{ label: "About Us", href: "#" }, { label: "Careers", href: "#" }, { label: "Press", href: "#" }, { label: "Blog", href: "#" }],
  },
  {
    title: "Help",
    links: [{ label: "Customer Service", href: "#" }, { label: "Track Order", href: "#" }, { label: "Returns & Refunds", href: "#" }, { label: "Shipping Info", href: "#" }, { label: "FAQs", href: "#" }],
  },
  {
    title: "Legal",
    links: [{ label: "Privacy Policy", href: "#" }, { label: "Terms of Use", href: "#" }, { label: "Cookie Policy", href: "#" }, { label: "Accessibility", href: "#" }],
  },
]

const paymentIcons = ["VISA", "Mastercard", "PayPal", "Apple Pay"]

export function Footer() {
  const [categories, setCategories] = useState<Category[]>([])

  useEffect(() => {
    fetchCategories().then(setCategories)
  }, [])

  const shopLinks = [
    { label: "All Products", href: "/products" },
    ...categories.slice(0, 4).map((cat) => ({
      label: cat.name,
      href: `/products?category=${cat.slug}`,
    })),
  ]

  const footerLinks = [
    ...staticLinks.slice(0, 2),
    { title: "Shop", links: shopLinks },
    staticLinks[2],
  ]

  return (
    <footer className="bg-neutral-900 text-neutral-300 border-t border-neutral-800 mt-auto dark:bg-neutral-950">
      

      <div className="max-w-[1440px] mx-auto px-4 lg:px-6 py-10">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-8">
          <div className="col-span-2">
            <Link to="/" className="inline-block mb-4 text-white hover:text-neutral-200 transition-colors">
              <span className="text-3xl font-black">AJIO</span>
            </Link>
            <p className="text-sm text-neutral-400 leading-relaxed mb-4">
              Your fashion destination. Discover the latest trends and products.
            </p>
            <div className="flex gap-3">
              {["f", "t", "in", "yt"].map((label, i) => (
                <a key={i} href="#" className="size-8 rounded-full bg-neutral-800 text-neutral-300 flex items-center justify-center hover:bg-neutral-700 hover:text-white transition-colors text-xs font-bold">
                  {label}
                </a>
              ))}
            </div>
          </div>

          {footerLinks.map((section) => (
            <div key={section.title}>
              <h3 className="text-xs font-bold text-neutral-200 uppercase tracking-widest mb-3">{section.title}</h3>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link to={link.href} className="text-sm text-neutral-400 hover:text-white transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <Separator className="my-8 bg-neutral-800" />

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex flex-wrap gap-4 text-xs text-neutral-400">
            <span className="flex items-center gap-1.5"><MapPin className="size-3.5" /> San Francisco, USA</span>
            <span className="flex items-center gap-1.5"><Phone className="size-3.5" /> 1-800-889-9991</span>
            <span className="flex items-center gap-1.5"><Mail className="size-3.5" /> support@ajio.clone</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {paymentIcons.map((p) => (
              <span key={p} className="px-2 py-1 text-[10px] font-bold text-neutral-400 border border-neutral-800 rounded bg-neutral-800/50">
                {p}
              </span>
            ))}
          </div>
        </div>

        <Separator className="my-6 bg-neutral-800" />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-neutral-400">
          <p>© 2024 AJIO.clone — A frontend demo project. Not affiliated with AJIO or Reliance.</p>
          <p>Powered by <a href="https://dummyjson.com/" className="hover:text-white transition-colors" target="_blank" rel="noreferrer">DummyJSON API</a></p>
        </div>
      </div>
    </footer>
  )
}
