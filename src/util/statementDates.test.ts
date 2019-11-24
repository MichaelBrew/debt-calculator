import * as moment from "moment";
import { getStatementClosingDate, getStatementOpeningDate, getStatementPaymentDate } from "./statementDates";

describe("statementDates", () => {
  describe("getStatementOpeningDate", () => {
    test("returns correct opening dates for closing dates", () => {
      // [openingDate, closingDate]
      const statementDates = [
        ["2018-12-01", "2018-12-31"],
        ["2018-12-02", "2019-01-01"],
        ["2019-02-01", "2019-02-28"],
        ["2019-02-28", "2019-03-27"],
        ["2019-03-05", "2019-04-04"],
      ];
      statementDates.forEach(([openingDateStr, closingDateStr]) => {
        const openingDate: Date = getStatementOpeningDate(new Date(closingDateStr));
        const isSameDate = moment.utc(openingDate).isSame(new Date(openingDateStr), "day");
        expect(isSameDate).toBeTruthy();
      });
    });
  });

  describe("getStatementClosingDate", () => {
    test("returns correct closing dates for closing day of month", () => {
      const currentDate = new Date("2019-01-15");
      // [closingDayOfMonth, closingDate]
      const closingDates: Array<Array<number | string>> = [
        [1, "2019-02-01"],
        [15, "2019-01-15"],
        [14, "2019-02-14"],
        [16, "2019-01-16"],
        [17, "2019-01-17"],
      ];
      closingDates.forEach(([closingDayOfMonth, closingDateStr]) => {
        const closingDate: Date = getStatementClosingDate(currentDate, closingDayOfMonth as number);
        const isSameDate = moment.utc(closingDate).isSame(new Date(closingDateStr), "day");
        expect(isSameDate).toBeTruthy();
      });
    })
  });

  describe("getStatementPaymentDate", () => {
    test("returns correct due date for opening dates", () => {
      // [openingDate, paymentDayOfMonth, paymentDate]
      const paymentDates: Array<Array<number | string>> = [
        ["2018-12-30", 2, "2019-01-02"],
        ["2019-01-05", 6, "2019-01-06"],
        ["2019-01-15", 14, "2019-02-14"],
        ["2019-01-15", 15, "2019-01-15"],
      ];
      paymentDates.forEach(([openingDateStr, paymentDueDay, paymentDateStr]) => {
        const paymentDate: Date = getStatementPaymentDate(new Date(openingDateStr), paymentDueDay as number);
        const isSameDate = moment.utc(paymentDate).isSame(new Date(paymentDateStr), "day");
        expect(isSameDate).toBeTruthy();
      });
    });
  });
});
