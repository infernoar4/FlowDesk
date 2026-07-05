import { Search } from "lucide-react";
import type { InputHTMLAttributes } from "react";

export function SearchBar(props: InputHTMLAttributes<HTMLInputElement>) {
  const { className = "", placeholder = "Search…", ...rest } = props;
  return (
    <div className={`relative ${className}`}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <input
        type="text"
        placeholder={placeholder}
        className="w-full h-10 pl-9 pr-3 rounded-lg bg-background border border-border text-sm placeholder:text-muted-foreground focus:outline-none focus:border-ring transition-colors"
        {...rest}
      />
    </div>
  );
}
