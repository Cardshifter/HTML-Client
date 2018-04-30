/* 
 * Fixes encoding issues in strings which were originally UTF-8 but decoded as ISO-8859-1.
 * @source https://askleo.com/why_do_i_get_odd_characters_instead_of_quotes_in_my_documents/
 */
const fixEncoding = function(inputString) {
    let fixedString = "";
    // this is needed to turn `inputString` into a plain JS string, which is may or may not be.
    inputString = inputString.toString();
    // â€™ to single quote
    fixedString = inputString.replace(/â€™/gi, "\'");
    return fixedString;
};