"use client";

import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { QuestionCategory } from "@/lib/questions";

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
  onCategoryChange,
}: CategoryFilterProps) {
  const toggleCategory = (category: string) => {
    if (selectedCategories.includes(category)) {
      onCategoryChange(selectedCategories.filter((c) => c !== category));
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

  const isSelected = (category: string) =>
    selectedCategories.includes(category);
  const isAllSelected =
    selectedCategories.length === 0 ||
    selectedCategories.length === categories.length;
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
      <div
        className="flex flex-wrap gap-2"
        role="group"
        aria-label="Filter by category"
      >
        {/* All Categories Button */}
        <button
          type="button"
          aria-pressed={isAllSelected}
          onClick={isAllSelected ? clearAll : selectAll}
          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 ${
            isAllSelected
              ? "bg-gray-900 text-white hover:bg-gray-800"
              : "border border-gray-200 bg-transparent hover:bg-gray-100"
          }`}
        >
          All
          <span className="ml-1 opacity-75">
            (
            {categories.reduce(
              (sum, cat) => sum + (categoryCounts[cat] || 0),
              0,
            )}
            )
          </span>
        </button>

        {/* Individual Category Buttons */}
        {categories.map((category) => {
          const count = categoryCounts[category] || 0;
          const selected = isSelected(category);

          const getCategoryStyles = (cat: string) => {
            const baseStyles =
              "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2";

            switch (cat) {
              case "Personal":
                return selected
                  ? `${baseStyles} bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500`
                  : `${baseStyles} border border-blue-200 text-blue-700 hover:bg-blue-50 focus:ring-blue-500`;
              case "Relationships":
                return selected
                  ? `${baseStyles} bg-pink-600 hover:bg-pink-700 text-white focus:ring-pink-500`
                  : `${baseStyles} border border-pink-200 text-pink-700 hover:bg-pink-50 focus:ring-pink-500`;
              case "Embarrassing":
                return selected
                  ? `${baseStyles} bg-red-600 hover:bg-red-700 text-white focus:ring-red-500`
                  : `${baseStyles} border border-red-200 text-red-700 hover:bg-red-50 focus:ring-red-500`;
              case "Fears & Dreams":
                return selected
                  ? `${baseStyles} bg-purple-600 hover:bg-purple-700 text-white focus:ring-purple-500`
                  : `${baseStyles} border border-purple-200 text-purple-700 hover:bg-purple-50 focus:ring-purple-500`;
              case "Opinions":
                return selected
                  ? `${baseStyles} bg-orange-600 hover:bg-orange-700 text-white focus:ring-orange-500`
                  : `${baseStyles} border border-orange-200 text-orange-700 hover:bg-orange-50 focus:ring-orange-500`;
              case "Work/School":
                return selected
                  ? `${baseStyles} bg-green-600 hover:bg-green-700 text-white focus:ring-green-500`
                  : `${baseStyles} border border-green-200 text-green-700 hover:bg-green-50 focus:ring-green-500`;
              case "Random":
                return selected
                  ? `${baseStyles} bg-indigo-600 hover:bg-indigo-700 text-white focus:ring-indigo-500`
                  : `${baseStyles} border border-indigo-200 text-indigo-700 hover:bg-indigo-50 focus:ring-indigo-500`;
              default:
                return selected
                  ? `${baseStyles} bg-gray-600 hover:bg-gray-700 text-white focus:ring-gray-500`
                  : `${baseStyles} border border-gray-200 text-gray-700 hover:bg-gray-50 focus:ring-gray-500`;
            }
          };

          return (
            <button
              key={category}
              type="button"
              aria-pressed={selected}
              onClick={() => toggleCategory(category)}
              className={getCategoryStyles(category)}
            >
              {category}
              <span className="ml-1 opacity-75">({count})</span>
            </button>
          );
        })}
      </div>

      {/* Active Filters Summary */}
      {hasSelections && selectedCategories.length < categories.length && (
        <div className="text-xs text-gray-500">
          Showing {selectedCategories.length} of {categories.length} categories
          (
          {selectedCategories.reduce(
            (sum, cat) => sum + (categoryCounts[cat] || 0),
            0,
          )}{" "}
          questions)
        </div>
      )}
    </div>
  );
}
