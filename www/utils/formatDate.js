/* global DEFAULT_DATE_FORMAT */

/**
 * Formats a Date object based on a format string, e.g., "yyyy/MM/dd hh:mm:ss"
 * 
 * @param {Date} date - the Date to format
 * @param {String} formatString - the format string to use
 * @returns {String} - the formatted date
 * @source https://dzone.com/articles/javascript-formatdate-function (but modified quite a bit)
 */
const formatDate = function (date, formatString = DEFAULT_DATE_FORMAT) {
  if (!(date instanceof Date)) {
    return "";
  }

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const format = {
    yyyy: date.getFullYear(),
    M: date.getMonth() + 1,
    d: date.getDate(),
    h: date.getHours(),
    m: date.getMinutes(),
    s: date.getSeconds()
  };
  format.yy = format.yyyy.toString().slice(-2);
  format.MM = format.M < 10 ? `0${format.M}` : M;
  format.MMM = months[date.getMonth()];
  format.dd = format.d < 10 ? `0${format.d}` : format.d;
  format.hh = format.h < 10 ? `0${format.h}` : format.h;
  format.mm = format.m < 10 ? `0${format.m}` : format.m;
  format.ss = format.s < 10 ? `0${format.s}` : format.s;

  const regex = /yyyy|yy|MMM|MM|M|dd|d|hh|h|mm|m|ss|s/g;
  return formatString.replace(regex, s => format[s] || s);
};
