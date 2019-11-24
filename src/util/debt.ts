import * as moment from "moment";
import { sortBy, sumBy } from "lodash";

import { DebtAccount, DebtAccountsPayoff } from "../interfaces";
import { calculateInterestChargedForMonth, getAnnualPercentageRateFromPeriods } from "./interest";

enum PAYOFF_STRATEGY {
  SNOWBALL,
  AVALANCHE,
}

function sortAccountsWithStrategy(
  accounts: Array<DebtAccount>,
  strategy: PAYOFF_STRATEGY,
  currentDate: Date = new Date()
): Array<DebtAccount> {
  return sortBy(
    accounts,
    (account: DebtAccount): number =>
      strategy === PAYOFF_STRATEGY.SNOWBALL
        ? account.currentBalanceCents // lowest balance first
        : -getAnnualPercentageRateFromPeriods(account.annualPercentageRates, currentDate) // highest APR first
  );
}

export function calculatePayoffTimeline(
  accounts: Array<DebtAccount>,
  strategy: PAYOFF_STRATEGY,
  monthlyPaymentCents: number,
  fromDate: Date = new Date(),
): DebtAccountsPayoff {
  const MAX_LIMIT_MONTHS = 12 * 10; // don't calculate more than 10 years out

  const currentDate: moment.Moment = moment.utc(fromDate).startOf("day");
  const maxCalculationDate: moment.Moment = currentDate.clone().add(MAX_LIMIT_MONTHS, "months");

  let totalPaidCents = 0;
  let accountsWithBalance = accounts.map(account => ({ ...account }));
  accountsWithBalance = sortAccountsWithStrategy(accountsWithBalance, strategy, currentDate.toDate());

  while (accountsWithBalance.length > 0 && currentDate.isSameOrBefore(maxCalculationDate, "day")) {
    let availablePaymentCents = monthlyPaymentCents;

    // Pay minimums on all accounts (or remaining balance if remaining balance is less than minimum)
    accountsWithBalance.forEach((account: DebtAccount): void => {
      const amountDueCents: number = Math.min(account.currentBalanceCents, account.minimumPaymentCents);
      const amountPaidCents: number = Math.min(availablePaymentCents, amountDueCents);
      const interestChargedCents: number =
        calculateInterestChargedForMonth(currentDate.toDate(), account, amountPaidCents, currentDate.date());
      account.currentBalanceCents = account.currentBalanceCents + interestChargedCents - amountPaidCents;
      availablePaymentCents -= amountPaidCents;
      totalPaidCents += amountPaidCents;
      // totalInterestPaidCents += Math.min(interestChargedCents, amountPaidCents);
    });

    // Remove any paid off accounts
    while (accountsWithBalance.length > 0 && accountsWithBalance[0].currentBalanceCents === 0) {
      accountsWithBalance.shift();
    }

    // Apply extra payment(s) to next account(s) in line
    while (accountsWithBalance.length > 0 && availablePaymentCents > 0) {
      const extraPaymentCents = Math.min(accountsWithBalance[0].currentBalanceCents, availablePaymentCents);
      accountsWithBalance[0].currentBalanceCents -= extraPaymentCents;
      availablePaymentCents -= extraPaymentCents;
      totalPaidCents += extraPaymentCents;
      if (accountsWithBalance[0].currentBalanceCents === 0) {
        accountsWithBalance.shift();
      }
    }

    // Advance currentDate by 1 month if there are still any accounts to pay off
    if (accountsWithBalance.length > 0) {
      currentDate.add(1, "month");
    }

    // If using AVALANCHE strategy, re-sort accounts in case any account hit a new accountPercentageRate
    if (strategy === PAYOFF_STRATEGY.AVALANCHE) {
      accountsWithBalance = sortAccountsWithStrategy(accountsWithBalance, strategy, currentDate.toDate());
    }
  }

  const didPayOff = accountsWithBalance.length === 0;
  const originalBalanceCents = sumBy(accounts, "currentBalanceCents");
  return {
    totalInterestPaidCents: didPayOff ? totalPaidCents - originalBalanceCents : null,
    totalPrincipalPaidCents: didPayOff ? originalBalanceCents : null,
    payoffDate: didPayOff ? currentDate.toDate() : null,
  };
}
