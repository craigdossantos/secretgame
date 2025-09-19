'use client';

import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { QuestionCategory } from '@/lib/questions';

interface CategoryFilterProps {
  categories: QuestionCategory[];
  categoryCounts: Record<string, number>;
  selectedCategories: string[];
  onCategoryChange: (categories: string[]) => void;
}

export function CategoryFilter({
  categories,
  categoryCounts,
  selectedCategories,
  onCategoryChange
}: CategoryFilterProps) {
  const toggleCategory = (category: string) => {
    if (selectedCategories.includes(category)) {
      onCategoryChange(selectedCategories.filter(c => c !== category));
    } else {
      onCategoryChange([...selectedCategories, category]);
    }
  };

  const clearAll = () => {
    onCategoryChange([]);
  };

  const selectAll = () => {
    onCategoryChange(categories);
  };

  const isSelected = (category: string) => selectedCategories.includes(category);
  const isAllSelected = selectedCategories.length === 0 || selectedCategories.length === categories.length;
  const hasSelections = selectedCategories.length > 0;

  return (
    <div className="space-y-3">
      {/* Header with controls */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-700">
          Filter by Category
        </h3>
        <div className="flex items-center gap-2">
          {hasSelections && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAll}
              className="text-xs h-7 px-2 text-gray-500 hover:text-gray-700"
            >
              <X className="w-3 h-3 mr-1" />
              Clear
            </Button>
          )}
          {!isAllSelected && (
            <Button
              variant="ghost"
              size="sm"
              onClick={selectAll}
              className="text-xs h-7 px-2 text-gray-500 hover:text-gray-700"
            >
              Show All
            </Button>
          )}
        </div>
      </div>

      {/* Category Tags */}
      <div className="flex flex-wrap gap-2">
        {/* All Categories Badge */}
        <Badge
          variant={isAllSelected ? "default" : "outline"}
          className={`cursor-pointer transition-all duration-200 hover:scale-105 ${
            isAllSelected
              ? 'bg-gray-900 text-white hover:bg-gray-800'
              : 'hover:bg-gray-100'
          }`}
          onClick={isAllSelected ? clearAll : selectAll}
        >
          All
          <span className="ml-1 text-xs opacity-75">
            ({categories.reduce((sum, cat) => sum + (categoryCounts[cat] || 0), 0)})
          </span>
        </Badge>

        {/* Individual Category Badges */}
        {categories.map((category) => {
          const count = categoryCounts[category] || 0;
          const selected = isSelected(category);

          const getCategoryColor = (cat: string) => {
            switch (cat) {
              case 'Personal': return selected ? 'bg-blue-600 hover:bg-blue-700' : 'hover:bg-blue-50 border-blue-200 text-blue-700';
              case 'Relationships': return selected ? 'bg-pink-600 hover:bg-pink-700' : 'hover:bg-pink-50 border-pink-200 text-pink-700';
              case 'Embarrassing': return selected ? 'bg-red-600 hover:bg-red-700' : 'hover:bg-red-50 border-red-200 text-red-700';
              case 'Fears & Dreams': return selected ? 'bg-purple-600 hover:bg-purple-700' : 'hover:bg-purple-50 border-purple-200 text-purple-700';
              case 'Opinions': return selected ? 'bg-orange-600 hover:bg-orange-700' : 'hover:bg-orange-50 border-orange-200 text-orange-700';
              case 'Work/School': return selected ? 'bg-green-600 hover:bg-green-700' : 'hover:bg-green-50 border-green-200 text-green-700';
              case 'Random': return selected ? 'bg-indigo-600 hover:bg-indigo-700' : 'hover:bg-indigo-50 border-indigo-200 text-indigo-700';
              default: return selected ? 'bg-gray-600 hover:bg-gray-700' : 'hover:bg-gray-50 border-gray-200 text-gray-700';
            }
          };

          return (
            <Badge
              key={category}
              variant={selected ? "default" : "outline"}
              className={`cursor-pointer transition-all duration-200 hover:scale-105 ${
                selected
                  ? `${getCategoryColor(category)} text-white`
                  : getCategoryColor(category)
              }`}
              onClick={() => toggleCategory(category)}
            >
              {category}
              <span className="ml-1 text-xs opacity-75">
                ({count})
              </span>
            </Badge>
          );
        })}
      </div>

      {/* Active Filters Summary */}
      {hasSelections && selectedCategories.length < categories.length && (
        <div className="text-xs text-gray-500">
          Showing {selectedCategories.length} of {categories.length} categories
          ({selectedCategories.reduce((sum, cat) => sum + (categoryCounts[cat] || 0), 0)} questions)
        </div>
      )}
    </div>
  );
}