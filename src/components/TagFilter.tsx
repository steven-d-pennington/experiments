import React from 'react';
import styled from 'styled-components';
import { experiments } from '../experiments/registry';

const TagList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.7em;
  margin-bottom: 1.5em;
`;

const TagButton = styled.button<{ selected: boolean }>`
  background: ${({ selected }) => (selected ? 'var(--color-accent)' : 'var(--color-surface)')};
  color: ${({ selected }) => (selected ? 'var(--color-background)' : 'var(--color-text)')};
  border: none;
  border-radius: 0.5em;
  padding: 0.3em 1em;
  font-size: 1em;
  cursor: pointer;
  transition: background 0.2s, color 0.2s;
  &:hover {
    background: var(--color-accent);
    color: var(--color-background);
  }
`;

interface TagFilterProps {
  selectedTag: string | null;
  onSelect: (tag: string | null) => void;
}

const TagFilter: React.FC<TagFilterProps> = ({ selectedTag, onSelect }) => {
  const allTags = Array.from(new Set(experiments.flatMap(e => e.tags)));
  return (
    <TagList>
      <TagButton selected={!selectedTag} onClick={() => onSelect(null)}>
        All
      </TagButton>
      {allTags.map(tag => (
        <TagButton
          key={tag}
          selected={selectedTag === tag}
          onClick={() => onSelect(tag)}
        >
          {tag}
        </TagButton>
      ))}
    </TagList>
  );
};

export default TagFilter; 