import { Input } from "@/components/ui/input";

// Reusable table header component with search functionality
const TableHeader = ({ title, searchValue, onSearchChange, searchPlaceholder, totalCount, children }) => {
  return (
    <div className="p-6 border-b border-gray-600/20 bg-transparent">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">{title}</h2>
        <div className="flex items-center gap-4">
          {children}
          <Input
            placeholder={searchPlaceholder}
            className="max-w-sm bg-transparent/10 border-gray-600/30 text-white placeholder:text-gray-400"
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
      </div>
      {totalCount !== undefined && (
        <div className="mt-2 text-sm text-gray-300">
          Total: <span className="font-semibold text-white">{totalCount}</span>
        </div>
      )}
    </div>
  );
};

export default TableHeader;
