import { supabase } from '../lib/supabase';

const VISIT_DAY_KEY = 'recallify_visit_day';
const VALID_STATS = new Set(['hearts', 'visitors']);

function requireStat(key) {
  if (!VALID_STATS.has(key)) throw new Error('Unsupported site statistic.');
}

export async function getCount(key) {
  requireStat(key);
  if (!supabase) return 0;
  const { data, error } = await supabase
    .from('site_stats')
    .select('count')
    .eq('key', key)
    .maybeSingle();
  if (error) throw error;
  return Number(data?.count || 0);
}

export async function incrementCount(key) {
  requireStat(key);
  if (!supabase) return null;
  const { data, error } = await supabase.rpc('increment_site_stat', { stat_name: key });
  if (error) throw error;
  return Number(data || 0);
}

export function shouldCountVisit() {
  const today = new Date().toISOString().slice(0, 10);
  return localStorage.getItem(VISIT_DAY_KEY) !== today;
}

export function markVisitCounted() {
  localStorage.setItem(VISIT_DAY_KEY, new Date().toISOString().slice(0, 10));
}
