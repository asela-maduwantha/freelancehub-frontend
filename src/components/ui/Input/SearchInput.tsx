import React from 'react';
import { Search } from 'lucide-react';

const SearchBar: React.FC = () => {
  const [searchQuery, setSearchQuery] = React.useState('');

  return (
    <div className="relative max-w-md w-full">
      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
        <Search className="h-5 w-5 text-[var(--color-text-secondary)]" />
      </div>
      <input
        type="text"
        placeholder="Search for skills or services..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="input-default w-full pl-12 pr-4 py-3 rounded-lg focus:outline-none shadow-sm"
      />
    </div>
  );
};

export default SearchBar;