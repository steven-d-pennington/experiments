import Head from "next/head";
import Image from "next/image";
import { Geist, Geist_Mono } from "next/font/google";
import styles from "@/styles/Home.module.css";
import { experiments } from '../experiments/registry';
import { useRouter } from 'next/router';
import styled from 'styled-components';
import ThemeToggle from '../components/ThemeToggle';
import TagFilter from '../components/TagFilter';
import { useState, useEffect } from 'react';
import SearchBar from '../components/SearchBar';
import VoteButtons from '../components/VoteButtons';
import { fetchVotes } from '../lib/voting';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const GalleryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 2rem;
  margin: 2rem 0;
`;

const Card = styled.div`
  background: var(--color-surface);
  border-radius: 1em;
  box-shadow: 0 2px 16px rgba(0,0,0,0.06);
  padding: 1.5rem;
  cursor: pointer;
  transition: transform 0.15s, box-shadow 0.15s;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  &:hover {
    transform: translateY(-4px) scale(1.03);
    box-shadow: 0 8px 32px rgba(0,0,0,0.12);
  }
`;

const Thumb = styled.div`
  width: 100%;
  height: 180px;
  background: var(--color-background);
  border-radius: 0.7em;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
`;

const Tag = styled.span`
  background: var(--color-accent);
  color: var(--color-background);
  border-radius: 0.5em;
  padding: 0.2em 0.7em;
  font-size: 0.9em;
  margin-right: 0.5em;
`;

export default function Home() {
  const router = useRouter();
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'votes' | 'newest'>('votes');
  const [voteCounts, setVoteCounts] = useState<Record<string, number>>({});

  // Fetch vote counts for all experiments
  useEffect(() => {
    async function loadVotes() {
      const counts: Record<string, number> = {};
      await Promise.all(experiments.map(async (exp) => {
        try {
          const { total } = await fetchVotes(exp.id);
          counts[exp.id] = total;
        } catch {
          counts[exp.id] = 0;
        }
      }));
      setVoteCounts(counts);
    }
    if (sortBy === 'votes') loadVotes();
  }, [sortBy]);

  const filteredExperiments = experiments.filter(e => {
    const matchesTag = !selectedTag || e.tags.includes(selectedTag);
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      e.title.toLowerCase().includes(q) ||
      e.description.toLowerCase().includes(q) ||
      e.tags.some(tag => tag.toLowerCase().includes(q));
    return matchesTag && (!searchQuery || matchesSearch);
  });

  const sortedExperiments = [...filteredExperiments].sort((a, b) => {
    if (sortBy === 'votes') {
      return (voteCounts[b.id] || 0) - (voteCounts[a.id] || 0);
    } else {
      return new Date(b.created).getTime() - new Date(a.created).getTime();
    }
  });

  return (
    <>
      <Head>
        <title>Experiments Gallery</title>
        <meta name="description" content="A gallery of interactive web experiments and mini-games." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className={`${styles.page} ${geistSans.variable} ${geistMono.variable}`}>
        <main className={styles.main}>
          <ThemeToggle />
          <h1 style={{ marginTop: 0 }}>🧪 Experiments Gallery</h1>
          <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 16 }}>
            <SearchBar onSearch={setSearchQuery} />
            <button
              style={{ borderRadius: 8, padding: '0.5em 1.2em', background: 'var(--color-surface)', color: 'var(--color-text)', border: '1px solid var(--color-surface)', cursor: 'pointer' }}
              onClick={() => setSortBy(sortBy === 'votes' ? 'newest' : 'votes')}
            >
              Sort by: {sortBy === 'votes' ? 'Votes' : 'Newest'}
            </button>
          </div>
          <TagFilter selectedTag={selectedTag} onSelect={setSelectedTag} />
          <GalleryGrid>
            {sortedExperiments.map(exp => (
              <Card key={exp.id} onClick={() => router.push(`/experiments/${exp.id}`)}>
                <Thumb>
                  <Image src={exp.thumbnailUrl} alt={exp.title} width={320} height={180} style={{ objectFit: 'cover', width: '100%', height: '100%' }} />
                </Thumb>
                <h2 style={{ margin: '0 0 0.5em 0' }}>{exp.title}</h2>
                <p style={{ margin: '0 0 1em 0', color: 'var(--color-text-secondary)' }}>{exp.description}</p>
                <div>{exp.tags.map(tag => <Tag key={tag}>{tag}</Tag>)}</div>
                <div onClick={e => e.stopPropagation()}>
                  <VoteButtons experimentId={exp.id} />
                </div>
                {sortBy === 'votes' && <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginTop: 4 }}>Votes: {voteCounts[exp.id] ?? '...'}</div>}
              </Card>
            ))}
          </GalleryGrid>
        </main>
      </div>
    </>
  );
}
