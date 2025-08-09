import React, { useEffect, useState } from 'react';
import { fetchVotes, upsertVote } from '../lib/voting';
import styled from 'styled-components';
import { useUser } from '@supabase/auth-helpers-react';

const VoteContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  background: var(--color-surface);
  border-radius: 1em;
  padding: 0.5em 0.7em;
  min-width: 2.5em;
  box-shadow: 0 1px 4px rgba(0,0,0,0.04);
  margin-top: 0.5em;
  margin-bottom: 0.5em;
`;

const VoteBtn = styled.button<{ selected: boolean; up?: boolean }>`
  background: ${({ selected, up }) =>
    selected ? (up ? 'var(--color-accent)' : 'var(--color-error)') : 'transparent'};
  color: ${({ selected, up }) =>
    selected ? 'var(--color-background)' : up ? 'var(--color-accent)' : 'var(--color-error)'};
  border: none;
  border-radius: 50%;
  width: 2em;
  height: 2em;
  font-size: 1.2em;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0.1em 0;
  transition: background 0.18s, color 0.18s;
  &:hover {
    background: ${({ up }) => (up ? 'var(--color-accent)' : 'var(--color-error)')};
    color: var(--color-background);
  }
`;

const VoteCount = styled.span`
  font-size: 1.1em;
  font-weight: bold;
  margin: 0.2em 0;
  color: var(--color-text);
`;

interface VoteButtonsProps {
  experimentId: string;
}

const VoteButtons: React.FC<VoteButtonsProps> = ({ experimentId }) => {
  const user = useUser();
  const [vote, setVote] = useState<1 | -1 | 0>(0);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function refreshVotes() {
    setLoading(true);
    try {
      const { total, userVote } = await fetchVotes(experimentId, user);
      setCount(total);
      setVote(userVote as 1 | -1 | 0);
      setError(null);
    } catch (error) {
      console.error('Failed to load votes:', error);
      setError('Failed to load votes');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refreshVotes();
    // eslint-disable-next-line
  }, [experimentId]);

  async function handleVote(newVote: 1 | -1) {
    if (vote === newVote) return; // Prevent double voting
    setVote(newVote);
    setCount(c => c + (newVote - vote)); // Optimistic update
    try {
      const { total, userVote } = await upsertVote(experimentId, newVote, user);
      setCount(total);
      setVote(userVote as 1 | -1 | 0);
      setError(null);
    } catch (error) {
      console.error('Failed to vote:', error);
      setError('Failed to vote. Please try again.');
      setVote(vote); // Revert
      refreshVotes();
    }
  }

  return (
    <VoteContainer>
      <VoteBtn
        up
        selected={vote === 1}
        aria-label="Upvote"
        onClick={() => handleVote(1)}
        disabled={loading}
      >
        ▲
      </VoteBtn>
      <VoteCount>{loading ? '...' : count}</VoteCount>
      <VoteBtn
        selected={vote === -1}
        aria-label="Downvote"
        onClick={() => handleVote(-1)}
        disabled={loading}
      >
        ▼
      </VoteBtn>
      {error && <span style={{ color: 'var(--color-error)', marginTop: 4, fontSize: 12 }}>{error}</span>}
    </VoteContainer>
  );
};

export default VoteButtons; 