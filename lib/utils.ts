import moment from "moment";

export const formatCurrency = (
  amount: number,
  currency: string = "GHS",
): string => {
  return new Intl.NumberFormat("en-GH", {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 2,
  }).format(amount / 100);
};

export const formatDate = (date: string | Date): string => {
  return moment(date).format("D MMM YYYY");
};

export const formatDateTime = (date: string | Date): string => {
  return moment(date).format("D MMM YYYY, HH:mm");
};

export const formatTime = (date: string | Date): string => {
  return moment(date).format("HH:mm");
};

export const formatRelative = (date: string | Date): string => {
  return moment(date).fromNow();
};
