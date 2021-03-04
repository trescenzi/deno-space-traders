import {get} from './api.ts';

export enum LoanType {
  STARTUP = 'STARTUP',
  ENTERPRISE = 'ENTERPRISE',
}

enum LoanStatus {
  CURRENT,
}

interface Loan {
  type: LoanType,
  amount: number,
  collateralRequired: boolean,
  rate: number,
  termInDays: number
}

export interface UserLoan {
  due: string,
  id: string,
  repaymentAmount: number,
  status: LoanStatus,
  type: LoanType
}

export async function listLoans(token: string): Promise<[Loan]> {
  const res = await get(`game/loans?token=${token}`);
  const json = await res.json();
  return json.loans;
}
