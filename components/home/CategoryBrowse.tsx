import type { CategoryCount } from "@/lib/types/home";

interface CategoryBrowseProps {
  categories: CategoryCount[];
  activeCategory: string;
  onCategoryChange: (id: string) => void;
}

export function CategoryBrowse({ categories, activeCategory, onCategoryChange }: CategoryBrowseProps) {
  return (
    <div className="sec">
      <div className="sec-header">
        <div className="sec-left">
          <span className="sec-label">// browse by category</span>
        </div>
      </div>
      <div className="cat-scroll">
        {categories.map((cat) => (
          <div
            key={cat.id}
            className={`cat-chip${activeCategory === cat.id ? " active" : ""}`}
            onClick={() => onCategoryChange(cat.id)}
          >
            <span className="cat-chip-icon">{cat.icon}</span>
            <div className="cat-chip-text">
              <span className="cat-chip-name">{cat.name}</span>
              <span className="cat-chip-count">{cat.count} jobs</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
