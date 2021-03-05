import {post, get} from './api.ts';

enum LocationType {
  GAS_GIANT = 'GAS_GIANT',
  ASTEROID = 'ASTEROID',
  MOON = 'MOON',
  PLANET = 'PLANET',
}

interface Location {
  name: string,
  symbol: string,
  type: LocationType,
  x: number,
  y: number
}

interface System {
  symbol: string,
  name: string,
  locations: Location[],
}

export async function searchInSystem(system: string, token: string, type?: string) : Promise<Location[]> {
  const res = await get(`game/systems/${system}/locations`, type ? {type} : undefined, token);
  return (await res.json()).locations;
}

export async function searchSystems(token: string) : Promise<System[]> {
  const res = await get(`game/systems/`, undefined, token);
  return (await res.json()).systems;
}

export async function marketplace(location: string, token: string): Promise<any> {
  const res = await get(`game/locations/${location}/marketplace`, undefined, token);
  return await res.json();
}
