import { supabase } from './supabaseClient';

const VOTES_TABLE = 'experiment_votes';

// Generate or get a device id for anonymous voting
export function getUserDeviceId() {
  let id = localStorage.getItem('device_id');
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem('device_id', id);
  }
  return id;
}

// Fetch total votes and user vote for an experiment
export async function fetchVotes(experimentId: string) {
  const deviceId = getUserDeviceId();
  const { data, error } = await supabase
    .from(VOTES_TABLE)
    .select('vote, device_id')
    .eq('experiment_id', experimentId);
  if (error) throw error;
  let total = 0;
  let userVote = 0;
  for (const row of data) {
    total += row.vote;
    if (row.device_id === deviceId) userVote = row.vote;
  }
  return { total, userVote };
}

// Upsert a vote for the current device
export async function upsertVote(experimentId: string, vote: 1 | -1) {
  const deviceId = getUserDeviceId();
  const { error } = await supabase.from(VOTES_TABLE).upsert([
    { experiment_id: experimentId, vote, device_id: deviceId },
  ], { onConflict: 'experiment_id,device_id' });
  if (error) throw error;
  return fetchVotes(experimentId);
} 