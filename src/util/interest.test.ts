import { getInterestForMonth, getAnnualPercentageRateFromPeriods, calculateInterestChargedForMonth } from "./interest";
import { AnnualPercentageRatePeriod, DebtAccount } from "../interfaces";

describe("interest", () => {
  describe("getInterestForMonth", () => {
    test("calculates interest for monthly statement", () => {
      const averageDailyBalanceCents = 150000;
      const annualPercentageRate = 0.2;
      const openingDate: Date = new Date("2019-01-29");
      const closingDate: Date = new Date("2019-02-28");
      const interestCents: number = getInterestForMonth(
        averageDailyBalanceCents,
        annualPercentageRate,
        openingDate,
        closingDate,
      );
      expect(interestCents).toEqual(2548);
    });
  });

  describe("getAnnualPercentageRateFromPeriods", () => {
    test("returns single rate when only one rate used", () => {
      const annualPercentageRates: Array<AnnualPercentageRatePeriod> = [
        {
          annualPercentageRate: 0.2,
        },
      ];
      const selectedRate: number = getAnnualPercentageRateFromPeriods(annualPercentageRates);
      expect(selectedRate).toEqual(0.2);
    });

    test("returns correct rate when multiple rates used", () => {
      const annualPercentageRates: Array<AnnualPercentageRatePeriod> = [
        {
          annualPercentageRate: 0.2,
          endDate: new Date("2019-03-15"),
        }, {
          annualPercentageRate: 0.21,
          startDate: new Date("2019-03-16"),
          endDate: new Date("2019-10-15"),
        }, {
          annualPercentageRate: 0.22,
          startDate: new Date("2019-10-16"),
        },
      ];
      const expectedRates: Record<string, number> = {
        "2019-02-15": 0.2,
        "2019-03-14": 0.2,
        "2019-03-15": 0.2,
        "2019-03-16": 0.21,
        "2019-04-15": 0.21,
        "2019-10-15": 0.21,
        "2019-10-16": 0.22,
        "2019-11-15": 0.22,
      };
      Object.keys(expectedRates).forEach((dateStr: string) => {
        const selectedRate: number = getAnnualPercentageRateFromPeriods(annualPercentageRates, new Date(dateStr));
        expect(selectedRate).toEqual(expectedRates[dateStr]);
      });
    });
  });

  describe("calculateInterestChargedForMonth", () => {
    test("paymentCents lower than account balance", () => {
      const currentDate: Date = new Date("2019-01-15");
      const account: DebtAccount = {
        currentBalanceCents: 20000,
        minimumPaymentCents: 3000,
        closingDayOfMonth: 28,
        paymentDayOfMonth: 15,
        annualPercentageRates: [{ annualPercentageRate: 0.2 }],
      };
      const paymentCents = 10000;
      const interestCents: number = calculateInterestChargedForMonth(currentDate, account, paymentCents);
      expect(interestCents).toEqual(263);
    });

    test("paymentCents lower than account balance with early payment date", () => {
      const currentDate: Date = new Date("2019-01-15");
      const account: DebtAccount = {
        currentBalanceCents: 20000,
        minimumPaymentCents: 3000,
        closingDayOfMonth: 28,
        paymentDayOfMonth: 15,
        annualPercentageRates: [{ annualPercentageRate: 0.2 }],
      };
      const paymentCents = 10000;
      const paymentDayOfMonth = 1;
      const interestCents: number =
        calculateInterestChargedForMonth(currentDate, account, paymentCents, paymentDayOfMonth);
      expect(interestCents).toEqual(186);
    });

    test("paymentCents equal to account balance", () => {
      const currentDate: Date = new Date("2019-01-15");
      const account: DebtAccount = {
        currentBalanceCents: 20000,
        minimumPaymentCents: 3000,
        closingDayOfMonth: 28,
        paymentDayOfMonth: 15,
        annualPercentageRates: [{ annualPercentageRate: 0.2 }],
      };
      const paymentCents = 20000;
      const interestCents: number = calculateInterestChargedForMonth(currentDate, account, paymentCents);
      expect(interestCents).toEqual(186);
    });

    test("paymentCents more than account balance", () => {
      const currentDate: Date = new Date("2019-01-15");
      const account: DebtAccount = {
        currentBalanceCents: 20000,
        minimumPaymentCents: 3000,
        closingDayOfMonth: 28,
        paymentDayOfMonth: 15,
        annualPercentageRates: [{ annualPercentageRate: 0.2 }],
      };
      const paymentCents = 30000;
      const interestCents: number = calculateInterestChargedForMonth(currentDate, account, paymentCents);
      expect(interestCents).toEqual(186);
    });
  });
});
