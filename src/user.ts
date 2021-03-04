import {LoanType, UserLoan} from './loan.ts';
import {post, get} from './api.ts';

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

interface User {
  credits: number,
  loans: [UserLoan],
  ships: [any],
  username: string
}

export async function createUser(userName: string): Promise<NewUser> {
  const res = await post(`users/${userName}/token`);
  const json = await res.json();
  console.log(json);
  return json;
}

export async function getUser(userName: string, token: string): Promise<User> {
  const res = await get(`users/${userName}?token=${token}`);
  const json = await res.json();
  return json;
}

export async function takeoutLoan(userName: string, token: string, type: LoanType): Promise<User> {
  const res = await post(`users/${userName}/loans`, {type}, token);
  const json = await res.json();
  if (json.error) {
    throw new Error(json.error);
  }
  return json;
}
