
module.exports = {
    monthNames: ['Jan', 'Feb', 'Mar',
        'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep',
        'Oct', 'Nov', 'Dec'
    ],
    formatDate: function(d) {
        var dateUpdated = new Date(d);
        var timeDiff = new Date().getTime() - d;
        var timeString = '';

        if (timeDiff < (1000 * 60 * 60 * 24) && timeDiff >= 0) {
            if (timeDiff < 1000 * 60) {
                timeString = 'Just Now!';
            } else if (timeDiff < (1000 * 60 * 60)) {
                timeString = parseInt(timeDiff / 1000 / 60) + ' min ago';
            } else if (timeDiff < (1000 * 120 * 60)) {
                timeString = parseInt(timeDiff / 1000 / 60 / 60) + ' hour ago';
            } else {
                timeString = parseInt(timeDiff / 1000 / 60 / 60) + ' hours ago';
            }
        } else {
            timeString = this.monthNames[dateUpdated.getMonth()] + ' ' + dateUpdated.getDate();
        }

        return timeString;
    },
    formatDateToString: function(d, opts) {
        var str = '';
        var date = new Date(d);

        opts = opts || {};
        str += this.monthNames[date.getMonth()] +
            (opts.skipDay ? '' : ' ' + date.getDate()) + ', ' + date.getFullYear();
        return str;
    },
    recencyTime: function(timeInMilliSec, currentTime) {

        /*************************************************************
        Given time in milliseconds, return the difference in seconds,
        minutes, hours, and days. Display diff will give you the most
        appropriate string response.
        Example:
        { displayDiff: '4d',
         secondsDiff: '14400',
         minutesDiff: '240',
         hoursDiff: '',
         daysDiff: '' }
        *************************************************************/
        var oldTime = new Date(timeInMilliSec);
        var timeDiff = Math.abs(currentTime.getTime() - oldTime.getTime());
        var secondsDiff = Math.ceil(timeDiff / (1000));
        var minutesDiff = Math.ceil(timeDiff / (1000 * 60));
        var hoursDiff = Math.ceil(timeDiff / (1000 * 60 * 60));
        var daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
        var weeksDiff = Math.ceil(timeDiff / (1000 * 3600 * 24 * 7));
        var displayDiff;

        if (secondsDiff < 60) {
            displayDiff = secondsDiff + 's';
        } else if (minutesDiff < 60) {
            displayDiff = minutesDiff + 'm';
        } else if (hoursDiff < 18) {
            displayDiff = hoursDiff + 'h';
        } else if (daysDiff < 7) {
            displayDiff = daysDiff + 'd';
        } else {
            displayDiff = weeksDiff + 'w';
        }
        return {
            displayDiff: displayDiff,
            secondsDiff: secondsDiff,
            minutesDiff: minutesDiff,
            hoursDiff: hoursDiff,
            daysDiff: daysDiff,
            weeksDiff: weeksDiff
        };
    }
};
