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
  const res = await fetch(`https://api.spacetraders.io/game/loans?token=${token}`);
  const json = await res.json();
  return json.loans;
}
