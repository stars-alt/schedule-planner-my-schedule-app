import React, { useState } from 'react';
import { Plus, X, Tag } from 'lucide-react';
import { DEFAULT_CATEGORIES } from '../utils';

interface CategoryLegendProps {
  categories: Array<{ id: string; name: string; style: string }>;
  selectedCategory: string | null;
  onSelectCategory: (categoryName: string | null) => void;
  onAddCategory: (name: string) => void;
  onDeleteCategory: (id: string) => void;
}

export default function CategoryLegend({
  categories,
  selectedCategory,
  onSelectCategory,
  onAddCategory,
  onDeleteCategory
}: CategoryLegendProps) {
  const [newCatName, setNewCatName] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    onAddCategory(newCatName.trim());
    setNewCatName('');
    setIsAdding(false);
  };

  return (
    <div className="border-2 border-black bg-white p-4 square mb-6 high-density-shadow">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-2">
          <Tag className="w-5 h-5 text-black" />
          <h3 className="font-heading font-black text-base tracking-tight text-black uppercase">
            CATEGORY FILTER (카테고리 필터)
          </h3>
          <span className="text-xs text-neutral-500 font-mono">
            [CLICK TARGET]
          </span>
        </div>

        {/* Square CTA Button to Add Custom Category */}
        {!isAdding ? (
          <button
            onClick={() => setIsAdding(true)}
            id="btn-add-category"
            className="border-2 border-black bg-white text-black px-4 py-1.5 text-xs font-black cursor-pointer transition-all hover:bg-black hover:text-white flex items-center justify-center gap-1 font-heading uppercase"
          >
            <Plus className="w-3.5 h-3.5" />
            + ADD CATEGORY
          </button>
        ) : (
          <form onSubmit={handleSubmit} className="flex items-center gap-1 w-full md:w-auto">
            <input
              type="text"
              placeholder="카테고리명"
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              className="border-2 border-black bg-white px-2 py-1 text-xs text-black h-8 font-sans w-36 font-semibold"
              autoFocus
            />
            <button
              type="submit"
              className="border-2 border-black bg-black text-white px-3 py-1 text-xs font-bold h-8 cursor-pointer hover:bg-neutral-800"
            >
              확인
            </button>
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="border-2 border-neutral-300 bg-white text-neutral-500 px-2 py-1 text-xs font-medium h-8 cursor-pointer hover:border-black hover:text-black"
            >
              취소
            </button>
          </form>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {/* 'All' tag */}
        <button
          onClick={() => onSelectCategory(null)}
          className={`px-3 py-1.5 text-xs font-bold border-2 cursor-pointer transition-all flex items-center gap-1.5 square ${
            selectedCategory === null
              ? 'bg-black text-white border-black font-black'
              : 'bg-white text-neutral-600 border-neutral-300 hover:border-black hover:text-black'
          }`}
        >
          <span>전체 일정 ({categories.length + 1})</span>
        </button>

        {categories.map((cat) => {
          // Parse original background styling to check for highlight
          const isSelected = selectedCategory === cat.name;
          const isDefault = DEFAULT_CATEGORIES.some((d) => d.name === cat.name);

          return (
            <div
              key={cat.id}
              className={`flex items-center text-xs transition-all ${
                isSelected
                  ? 'scale-102 font-bold'
                  : 'opacity-90 hover:opacity-100'
              }`}
            >
              <button
                onClick={() => onSelectCategory(cat.name)}
                className={`px-3 py-1.5 border-2 border-r-0 border-black cursor-pointer font-bold flex items-center h-8 transition-colors ${cat.style} ${
                  isSelected ? 'ring-2 ring-black ring-offset-1' : ''
                }`}
              >
                {cat.name}
              </button>
              
              {!isDefault ? (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteCategory(cat.id);
                  }}
                  title="삭제"
                  className="border-2 border-black px-2 py-1.5 h-8 bg-white text-black cursor-pointer hover:bg-black hover:text-white flex items-center justify-center transition-all"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              ) : (
                <div className="border-2 border-black px-1.5 h-8 bg-white text-black font-mono flex items-center justify-center text-[9px] border-l-0 select-none">
                  •
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
