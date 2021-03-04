import {LoanType, UserLoan} from './loan.ts';
import {post, get} from './api.ts';
import {ShipClass} from './ships.ts';

export interface NewUser {
  token: string,
  user: {
    id: string,
    username: string,
    picture: any,
    email: string,
    credits: number,
    createdAt: string,
    updatedAt: string,
  }
};

export interface SpaceTraderUser {
  credits: number,
  loans: [UserLoan],
  ships: [any],
  username: string
}

export enum GoodType {
  FUEL = 'FUEL'
}

export async function createUser(userName: string): Promise<NewUser> {
  const res = await post(`users/${userName}/token`);
  const json = await res.json();
  console.log(json);
  return json;
}

export async function getUser(userName: string, token: string): Promise<SpaceTraderUser> {
  const res = await get(`users/${userName}?token=${token}`);
  const json = await res.json();
  return json;
}

export async function takeoutLoan(userName: string, token: string, type: LoanType): Promise<SpaceTraderUser> {
  const res = await post(`users/${userName}/loans`, {type}, token);
  const json = await res.json();
  if (json.error) {
    throw new Error(json.error);
  }
  return json;
}

export async function buyShip(userName: string, token: string, type: string, location: string): Promise<SpaceTraderUser> {
  const res = await post(`users/${userName}/ships`, {type, location}, token);
  const json = await res.json();
  if (json.error) {
    throw new Error(json.error);
  }
  return json;
}

export async function buyGood(userName: string, token: string, shipId: string, good: GoodType, quantity: number): Promise<SpaceTraderUser> {
  const res = await post(`users/${userName}/purchase-orders`, {shipId, good, quantity}, token);
  const json = await res.json();
  if (json.error) {
    throw new Error(json.error);
  }
  return json;
}

export class User {
  private userName: string;
  private _token: string;
  private user: Promise<SpaceTraderUser>;

  constructor(token: string, userName: string) {
    this.userName = userName;
    this._token = token;
    this.user = getUser(userName, token);
  }

  async buyShip(type: string, location: string): Promise<SpaceTraderUser> {
    this.user = buyShip(this.userName, this.token, type, location);
    return this.user;
  }

  async takeoutLoan(type: LoanType): Promise<SpaceTraderUser> {
    this.user = takeoutLoan(this.userName, this.token, type)
    return this.user;
  }

  async toString() : Promise<string> {
    return this.user.then(u => JSON.stringify(u));
  }

  async purchase(ship: string, good: GoodType, quantity: number): Promise<SpaceTraderUser> {
    this.user = buyGood(this.userName, this.token, ship, good, quantity);
    return this.user;
  }

  get token() {
    return this._token;
  }
}
