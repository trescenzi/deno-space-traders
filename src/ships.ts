import {get} from './api.ts';

export enum ShipClass {
  MKI = 'MK-I'
}

export interface Ship {
  class: ShipClass
  dockingEfficiency: number,
  fuelEfficiency: number,
  maintenance: number,
  manufacturer: string,
  maxCargo: number,
  plating: number,
  purchaseLocations: [{
    location: string,
    price: number
  }],
  speed: number,
  type: string,
  weapons: number
}

export async function listShips(c: ShipClass, token: string): Promise<[Ship]> {
  const res = await get(`game/ships?token=${token}&class=${c}`);
  return (await res.json() as {ships: [Ship]}).ships;
}
