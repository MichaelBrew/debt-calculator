import * as moment from "moment";
import { sum } from "lodash";

import { DebtAccount, AnnualPercentageRatePeriod } from "../interfaces";
import { getStatementOpeningDate, getStatementClosingDate, getStatementPaymentDate } from "./statementDates";

function getStatementDailyBalances(
  startingBalanceCents: number,
  paymentAmountCents: number,
  openingDate: Date,
  closingDate: Date,
  paymentDate: Date,
): Array<number> {
  const dailyBalances: Array<number> = [];
  const currentDate: moment.Moment = moment.utc(openingDate);
  while (currentDate.isSameOrBefore(closingDate, "days")) {
    const dailyBalanceCents = currentDate.isBefore(paymentDate, "days")
      ? startingBalanceCents
      : startingBalanceCents - paymentAmountCents;
    dailyBalances.push(Math.max(0, dailyBalanceCents));
    currentDate.add(1, "day");
  }
  return dailyBalances;
}

export function getInterestForMonth(
  averageDailyBalanceCents: number,
  annualPercentageRate: number,
  openingDate: Date,
  closingDate: Date,
): number {
  const dailyPercentageRate: number = annualPercentageRate / 365;
  // Add 1 because start of one day to end of next day will only give 1 day diff, but we want to consider it as 2
  const numDaysInStatement: number = moment.utc(closingDate).diff(openingDate, "days") + 1;
  const interestChargedCents: number = averageDailyBalanceCents * dailyPercentageRate * numDaysInStatement;
  return Math.round(interestChargedCents);
}

export function getAnnualPercentageRateFromPeriods(
  percentageRates: Array<AnnualPercentageRatePeriod>,
  closingDate?: Date,
): number {
  for (let i = 0; i < percentageRates.length; i++) {
    const { startDate, endDate, annualPercentageRate }: AnnualPercentageRatePeriod = percentageRates[i];
    if (!startDate && !endDate){
      return annualPercentageRate;
    } else if (startDate && endDate) {
      if (moment.utc(closingDate).isBetween(startDate, endDate, "day", "[]")) return annualPercentageRate;
    } else if (startDate) {
      if (moment.utc(closingDate).isSameOrAfter(startDate, "day")) return annualPercentageRate;
    } else if (endDate) {
      if (moment.utc(closingDate).isSameOrBefore(endDate, "day")) return annualPercentageRate;
    } else {
      return annualPercentageRate;
    }
  }
  throw new Error("Unable to find annual percentage rate for date");
}

export function calculateInterestChargedForMonth(
  currentDate: Date,
  account: DebtAccount,
  paymentCents: number,
  paymentDayOfMonth?: number,
): number {
  const closingDate: Date = getStatementClosingDate(currentDate, account.closingDayOfMonth);
  const openingDate: Date = getStatementOpeningDate(closingDate);
  const paymentDate: Date = paymentDayOfMonth
    ? getStatementPaymentDate(openingDate, paymentDayOfMonth)
    : getStatementPaymentDate(openingDate, account.paymentDayOfMonth);
  const dailyBalances: Array<number> = getStatementDailyBalances(
    account.currentBalanceCents,
    paymentCents,
    openingDate,
    closingDate,
    paymentDate,
  );
  const averageDailyBalanceCents: number = Math.round(sum(dailyBalances) / dailyBalances.length);
  const annualPercentageRate: number = getAnnualPercentageRateFromPeriods(account.annualPercentageRates, closingDate);
  return getInterestForMonth(averageDailyBalanceCents, annualPercentageRate, openingDate, closingDate);
}
