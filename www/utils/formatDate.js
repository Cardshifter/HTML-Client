/* global DEFAULT_DATE_FORMAT */

/**
 * Formats a Date object based on a format string, e.g., "yyyy/MM/dd hh:mm:ss"
 * Original source: 
 * https://dzone.com/articles/javascript-formatdate-function
 * Original source modified to fix a few bugs and modernize.
 * 
 * @param {Date} date - the Date to format
 * @param {String} formatString - the format string to use
 * @returns {String} - the formatted date
 */
const formatDate = function (date=new Date(), formatString=DEFAULT_DATE_FORMAT) {
    if(date instanceof Date) {
        const months = new Array("Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec");
        const yyyy = date.getFullYear();
        const yy = yyyy.toString().slice(-2);
        const M = date.getMonth() + 1;
        const MM = M < 10 ? `0${M}` : M;
        const MMM = months[M - 1];
        const d = date.getDate();
        const dd = d < 10 ? `0${d}` : d;
        const h = date.getHours();
        const hh = h < 10 ? `0${h}` : h;
        const m = date.getMinutes();
        const mm = m < 10 ? `0${m}` : m;
        const s = date.getSeconds();
        const ss = s < 10 ? `0${s}` : s;
        formatString = formatString.replace(/yyyy/, yyyy);
        formatString = formatString.replace(/yy/, yy);
        formatString = formatString.replace(/MMM/, MMM);
        formatString = formatString.replace(/MM/, MM);
        formatString = formatString.replace(/M/, M);
        formatString = formatString.replace(/dd/, dd);
        formatString = formatString.replace(/d/, d);
        formatString = formatString.replace(/hh/, hh);
        formatString = formatString.replace(/h/, h);
        formatString = formatString.replace(/mm/, mm);
        formatString = formatString.replace(/m/, m);
        formatString = formatString.replace(/ss/, ss);
        formatString = formatString.replace(/s/, s);
        return formatString;
    } else {
        return "";
    }
};
