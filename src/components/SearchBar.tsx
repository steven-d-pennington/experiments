import React, { useState } from 'react';
import styled from 'styled-components';

const SearchInput = styled.input`
  width: 100%;
  max-width: 400px;
  padding: 0.7em 1.2em;
  font-size: 1.1em;
  border-radius: 1.5em;
  border: 1px solid var(--color-surface);
  background: var(--color-background);
  color: var(--color-text);
  margin-bottom: 1.5em;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  outline: none;
  transition: border 0.2s;
  &:focus {
    border: 1.5px solid var(--color-accent);
  }
`;

interface SearchBarProps {
  onSearch: (query: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch }) => {
  const [value, setValue] = useState('');
  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setValue(e.target.value);
    onSearch(e.target.value);
  }
  return (
    <SearchInput
      type="search"
      placeholder="Search experiments..."
      value={value}
      onChange={handleChange}
      aria-label="Search experiments"
    />
  );
};

export default SearchBar; 