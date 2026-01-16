import { supabase } from './supabaseClient';
import { User } from '@supabase/supabase-js';

const VOTES_TABLE = 'experiment_votes';

// Generate or get a device id for anonymous voting
export function getUserDeviceId() {
  if (typeof window === 'undefined') return null; // Guard for SSR
  let id = localStorage.getItem('device_id');
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem('device_id', id);
  }
  return id;
}

// Fetch total votes and user vote for an experiment
export async function fetchVotes(experimentId: string, user: User | null) {
  const deviceId = getUserDeviceId();
  const rpcParams = { p_experiment_id: experimentId, p_user_id: user?.id, p_device_id: deviceId };

  const { data, error } = await supabase.rpc('get_experiment_votes', rpcParams);

  if (error) throw error;
  return data ? { total: data.total_votes, userVote: data.user_vote } : { total: 0, userVote: 0 };
}

// Upsert a vote for the current user or device
export async function upsertVote(experimentId: string, vote: 1 | -1, user: User | null) {
  const deviceId = getUserDeviceId();
  if (!user && !deviceId) throw new Error('User or device ID must be available to vote.');

  const { error } = await supabase
    .from(VOTES_TABLE)
    .upsert([{ experiment_id: experimentId, vote, user_id: user?.id, device_id: deviceId }], {
      onConflict: user ? 'experiment_id,user_id' : 'experiment_id,device_id',
    });

  if (error) throw error;
  return fetchVotes(experimentId, user);
}
