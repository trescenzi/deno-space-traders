import {LoanType, UserLoan} from './loan.ts';

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
  const res = await fetch(`https://api.spacetraders.io/users/${userName}/token`,
    {
    method: 'POST',
    });
  const json = await res.json();
  console.log(json);
  return json;
}

export async function getUser(userName: string, token: string): Promise<User> {
  const res = await fetch(`https://api.spacetraders.io/users/${userName}?token=${token}`);
  const json = await res.json();
  return json;
}

export async function takeoutLoan(userName: string, token: string, type: LoanType): Promise<User> {
  console.log(`https://api.spacetraders.io/users/${userName}/loans?token=${token}&type=${type}`);
  const res = await fetch(`https://api.spacetraders.io/users/${userName}/loans`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({
      type,
    })
  });
  const json = await res.json();
  if (json.error) {
    throw new Error(json.error);
  }
  return json;
}
