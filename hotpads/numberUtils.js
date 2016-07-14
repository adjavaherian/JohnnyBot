
var numeral = require('numeral');
var _ = require('lodash');

var numberUtils = {
    compact: function(rawNum) {
        var abbrev = '';
        var decimals = 0;
        var number;

        /**
         * Decimal adjustment of a number.
         * Handy function to properly round decimal numbers.
         * Using this, we get 3.195 => 3.2
         * JavaScript's toFixed(2) method would return 3.19
         *
         * @param {String}  type  The type of adjustment.
         * @param {Number}  value The number.
         * @param {Integer} exp   The exponent (the 10 logarithm of the adjustment base).
         * @returns {Number} The adjusted value.
        */
        function roundDecimal(type, value, exp) {
            // If the exp is undefined or zero...
            if (typeof exp === 'undefined' || Number(exp) === 0) {
                return Math[type](value);
            }
            value = Number(value);
            exp = Number(exp);
            // If the value is not a number or the exp is not an integer...
            if (isNaN(value) || !(typeof exp === 'number' && exp % 1 === 0)) {
                return NaN;
            }
            // Shift
            value = value.toString().split('e');
            value = Math[type](Number(value[0] + 'e' + (value[1] ? (Number(value[1]) - exp) : -exp)));
            // Shift back
            value = value.toString().split('e');
            return Number(value[0] + 'e' + (value[1] ? (Number(value[1]) + exp) : exp));
        }

        if (_.isArray(rawNum)) {
            rawNum = rawNum[0];
        }

        // Make sure we convert input to number and remove any commas and such.
        rawNum = Number(rawNum).toString().split(',').join('');

        if (rawNum >= 1000000) {
            // Result: 2,350,000 / 10,000 => 2.35m
            number = rawNum / 1000000;
            abbrev = 'm';
            number = roundDecimal('round', number, -2);
        } else if (rawNum >= 10000) {
            // Result: 235,500 / 1,000 => 235.5k
            // If a number with decimals is provided, remove decimals:
            number = rawNum / 1000;
            abbrev = 'k';
            // Check number of decimal places. If a rawNum = 795995, there's little
            // point in returning a value such as 795.995k. Convert to decimal and display
            // the full price. 795.995 => 795,995
            decimals = number.toString().split('.');
            if (decimals[1]) {
                number = numberUtils.prettyPrintNumber(rawNum);
                abbrev = '';
            }
        } else if (rawNum >= 0) {
            // Catch numbers < 1000:
            // 1234 => 1,234
            number = numberUtils.prettyPrintNumber(rawNum);
        } else {
            // Handle instances where we get invalid input.
            number = '--';
        }

        return number + abbrev;
    },
    asPercent: function(value) {
        var percent = numeral().unformat(value);

        return numeral(percent)
            .divide(100)
            .format('0%');
    },
    asCurrency: function(value) {
        var amount = numeral().unformat(value);

        return numeral(amount).format('$0,0');
    },
    prettyPrintNumber: function(int) {
        // Safari on iOS implements Number.prototype.toLocaleString() weirdly,
        // so we don't get nicely formatted numbers. "8431" on Safari is... "8431".
        // This handy function fixes that. Add's commas to numbers.
        // 1234 now becomes 1,234
        return int.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    }
};

module.exports = numberUtils;