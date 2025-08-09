import { useRouter } from 'next/router';
import React, { Suspense, lazy } from 'react';
import { getExperimentById } from '../../experiments/registry';
import ErrorBoundary from '../../components/ErrorBoundary';
import VoteButtons from '../../components/VoteButtons';

const ExperimentPage: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;

  if (!id || typeof id !== 'string') {
    return <div>Loading...</div>;
  }

  const experiment = getExperimentById(id);

  if (!experiment) {
    return (
      <div style={{ color: 'var(--color-error)', padding: 32, textAlign: 'center' }}>
        <h2>Experiment not found</h2>
        <button onClick={() => router.push('/')}>Back to Gallery</button>
      </div>
    );
  }

  const LazyExperiment = React.lazy(experiment.component);

  return (
    <ErrorBoundary>
      <div
        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 24 }}
      ></div>
      <Suspense fallback={<div>Loading experiment...</div>}>
        <LazyExperiment />
      </Suspense>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          margin: '32px 0 0 0',
        }}
      >
        <VoteButtons experimentId={experiment.id} />
      </div>
      <div style={{ marginTop: 24, textAlign: 'center' }}>
        <button onClick={() => router.push('/')}>← Back to Gallery</button>
      </div>
    </ErrorBoundary>
  );
};

export default ExperimentPage;
