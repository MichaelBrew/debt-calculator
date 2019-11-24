import * as moment from "moment";

export function getStatementOpeningDate(closingDate: Date): Date {
  return moment.utc(closingDate)
    .startOf("day")
    .add(1, "day")
    .subtract(1, "month")
    .toDate();
}

export function getStatementClosingDate(currentDate: Date, closingDayOfMonth: number): Date {
  const closingDate: moment.Moment = moment.utc(currentDate).endOf("day");
  while (closingDate.date() !== closingDayOfMonth) closingDate.add(1, "day");
  return closingDate.toDate();
}

export function getStatementPaymentDate(openingDate: Date, paymentDueDayOfMonth: number): Date {
  const paymentDate: moment.Moment = moment.utc(openingDate);
  while (paymentDate.date() !== paymentDueDayOfMonth) paymentDate.add(1, "day");
  return paymentDate.toDate();
}
