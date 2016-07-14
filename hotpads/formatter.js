var _ = require('lodash');
var formatter = {
    obj: {
        toQueryParams: function(obj) {
            var str = [];
            var p;

            for (p in obj) {
                if (obj.hasOwnProperty(p) && obj[p]) {
                    str.push(encodeURIComponent(p) + '=' + encodeURIComponent(obj[p]));
                }
            }
            return str.join('&');
        },
        toArraySplit: function(o, num) {
            var tempObj;
            var list = [];
            var i = 0;

            _.forEach(o, function(v, k) {
                if (i === 0) {
                    tempObj = {};
                    tempObj[k] = v;
                } else if (i % num === 0) {
                    list.push(tempObj);
                    tempObj = {};
                    tempObj[k] = v;
                } else if (i === _.size(o) - 1) {
                    tempObj[k] = v;
                    list.push(tempObj);
                } else {
                    tempObj[k] = v;
                }
                i++;
            });
            return list;
        },
        toCommaDelimitedString: function(input) {
            var keys = [];

            _.forOwn(input, function(value, key) {
                if (value === true) {
                    keys.push(key);
                }
            });
            return keys.join(',');
        }
    },
    string: {
        firstCaps: function(str) {
            var string = str || '';
            var pieces = string.split(' ');
            var i, j;

            for (i = 0; i < pieces.length; i++) {
                j = pieces[i].charAt(0).toUpperCase();
                pieces[i] = j + pieces[i].substr(1).toLowerCase();
            }
            return pieces.join(' ');
        },
        splitCamelCaseToLowerCaseWords: function(str) {
            var string = str || '';
            var pieces = string.split('');
            var newLetters = [];
            var i;

            for (i = 0; i < pieces.length; i++) {
                if (pieces[i] === pieces[i].toUpperCase() && pieces[i] !== ' ') {
                    if (i === 0) {
                        newLetters.push(pieces[i].toLowerCase());
                    } else {
                        newLetters.push(' ' + pieces[i].toLowerCase());
                    }
                } else {
                    newLetters.push(pieces[i]);
                }
            }
            return newLetters.join('');
        },
        allCaps: function(str) {
            var string = str || '';

            return string.toUpperCase();
        }
    },
    array: {
        last: function(arr) {
            if (arr.length > 0) {
                return arr[arr.length - 1];
            } else {
                return undefined;
            }
        }
    },
    sort: function(a, b) {
        return a - b;
    },
    theme: function(themeArray) {
        var theme = '';

        themeArray = _.flattenDeep(themeArray);
        _.forEach(themeArray, function(t) {
            if (t !== 'undefined' && t !== undefined && t !== '') {
                theme = theme + t + ' ';
            }
        });
        return theme.trim();
    }
};

module.exports = formatter;
