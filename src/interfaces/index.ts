import * as moment from "moment";

import { ACCOUNT_TYPE } from "../constants/account";

export interface AnnualPercentageRatePeriod {
  annualPercentageRate: number;
  startDate?: Date;
  endDate?: Date;
}

export interface Account {
  name: string;
  type: ACCOUNT_TYPE.CHECKING_ACCOUNT | ACCOUNT_TYPE.SAVINGS_ACCOUNT;
  currentBalanceCents: number;
}

export interface DebtAccount {
  name?: string;
  type?: ACCOUNT_TYPE.CREDIT_CARD | ACCOUNT_TYPE.AUTO_LOAN | ACCOUNT_TYPE.STUDENT_LOAN | ACCOUNT_TYPE.PERSONAL_LOAN;
  currentBalanceCents: number;
  minimumPaymentCents: number;
  closingDayOfMonth: number;
  paymentDayOfMonth: number;
  annualPercentageRates: Array<AnnualPercentageRatePeriod>;
}

export interface DebtAccountsPayoff {
  totalPrincipalPaidCents: number;
  totalInterestPaidCents: number;
  payoffDate?: Date;
}

export interface DebtAccountsPayoffFormatted {
  totalPrincipalPaid: string; // "$10,543.23"
  totalInterestPaid: string; // "$2,342.45"
  payoffDate?: string; // "October 15, 2021"
}
