import { calculatePayoffTimeline } from "./debt";
import { DebtAccount, DebtAccountsPayoff } from "../interfaces";
import { PAYOFF_STRATEGY } from "../constants/debt";
import { ACCOUNT_TYPE } from "../constants/account";

interface PayoffAccounts {
  fromDate: Date;
  monthlyPaymentCents: number;
  accounts: Array<DebtAccount>;
  expectedPayoff: DebtAccountsPayoff;
}

describe("debt", () => {
  describe("calculatePayoffTimeline", () => {
    describe("using AVALANCHE strategy", () => {
      test("calculates timeline for multiple accounts", () => {
        const payoffAccounts: Array<PayoffAccounts> = [
          {
            fromDate: new Date("2019-01-01"),
            monthlyPaymentCents: 30000,
            accounts: [
              {
                currentBalanceCents: 30000,
                minimumPaymentCents: 2000,
                closingDayOfMonth: 28,
                paymentDayOfMonth: 15,
                annualPercentageRates: [{ annualPercentageRate: 0.2 }],
                type: ACCOUNT_TYPE.CREDIT_CARD,
              },
            ],
            expectedPayoff: {
              totalPrincipalPaidCents: 30000,
              totalInterestPaidCents: 479,
              payoffDate: new Date("2019-02-01"),
            },
          },
          {
            fromDate: new Date("2019-01-01"),
            monthlyPaymentCents: 30000,
            accounts: [
              {
                currentBalanceCents: 30000,
                minimumPaymentCents: 2000,
                closingDayOfMonth: 28,
                paymentDayOfMonth: 15,
                annualPercentageRates: [{ annualPercentageRate: 0.2 }],
                type: ACCOUNT_TYPE.CREDIT_CARD,
              },
              {
                currentBalanceCents: 50000,
                minimumPaymentCents: 2000,
                closingDayOfMonth: 28,
                paymentDayOfMonth: 15,
                annualPercentageRates: [{ annualPercentageRate: 0.25 }],
                type: ACCOUNT_TYPE.CREDIT_CARD,
              },
            ],
            expectedPayoff: {
              totalPrincipalPaidCents: 80000,
              totalInterestPaidCents: 2635,
              payoffDate: new Date("2019-03-01"),
            },
          },
          {
            fromDate: new Date("2019-01-01"),
            monthlyPaymentCents: 30000,
            accounts: [
              {
                currentBalanceCents: 30000,
                minimumPaymentCents: 2000,
                closingDayOfMonth: 28,
                paymentDayOfMonth: 15,
                annualPercentageRates: [{ annualPercentageRate: 0.25 }],
                type: ACCOUNT_TYPE.CREDIT_CARD,
              },
              {
                currentBalanceCents: 50000,
                minimumPaymentCents: 2000,
                closingDayOfMonth: 28,
                paymentDayOfMonth: 15,
                annualPercentageRates: [{ annualPercentageRate: 0.20 }],
                type: ACCOUNT_TYPE.CREDIT_CARD,
              },
            ],
            expectedPayoff: {
              totalPrincipalPaidCents: 80000,
              totalInterestPaidCents: 2468,
              payoffDate: new Date("2019-03-01"),
            },
          },
          {
            fromDate: new Date("2019-01-01"),
            monthlyPaymentCents: 20000,
            accounts: [
              {
                currentBalanceCents: 850000,
                minimumPaymentCents: 1000,
                closingDayOfMonth: 28,
                paymentDayOfMonth: 15,
                annualPercentageRates: [{ annualPercentageRate: 0.18 }],
                type: ACCOUNT_TYPE.CREDIT_CARD,
              },
              {
                currentBalanceCents: 30000,
                minimumPaymentCents: 2000,
                closingDayOfMonth: 28,
                paymentDayOfMonth: 15,
                annualPercentageRates: [{ annualPercentageRate: 0.2 }],
                type: ACCOUNT_TYPE.CREDIT_CARD,
              },
              {
                currentBalanceCents: 50000,
                minimumPaymentCents: 2000,
                closingDayOfMonth: 28,
                paymentDayOfMonth: 15,
                annualPercentageRates: [{ annualPercentageRate: 0.25 }],
                type: ACCOUNT_TYPE.CREDIT_CARD,
              },
            ],
            expectedPayoff: {
              totalPrincipalPaidCents: 930000,
              totalInterestPaidCents: 669817,
              payoffDate: new Date("2025-08-01"),
            },
          },
        ];

        payoffAccounts.forEach(({ accounts, monthlyPaymentCents, fromDate, expectedPayoff }) => {
          const calculatedPayoff =
            calculatePayoffTimeline(accounts, PAYOFF_STRATEGY.AVALANCHE, monthlyPaymentCents, fromDate);
          expect(calculatedPayoff).toMatchObject(expectedPayoff);
        });
      });
    });
  });
});
