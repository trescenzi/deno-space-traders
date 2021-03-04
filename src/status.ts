import {get} from './api.ts';

export async function status(): Promise<string> {
  const res = await get('game/status');
  const {status}: {status: string} = await res.json();
  return status;
}

export async function isOnline(): Promise<boolean> {
  const s = await status();
  return s === 'spacetraders is currently online and available to play';
}
