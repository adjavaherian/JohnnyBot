// utils.js
// basic utils for mearsebot

module.exports = {

    randomPicker: function randomPicker(arr) {
        if(typeof arr !== 'undefined' && arr.length) {
            return arr[Math.floor(Math.random() * arr.length)];
        } else {
            return '!@#%@#%'
        }

    },
    formatUptime : function formatUptime(uptime) {
        var unit = 'second';
        if (uptime > 60) {
            uptime = uptime / 60;
            unit = 'minute';
        }
        if (uptime > 60) {
            uptime = uptime / 60;
            unit = 'hour';
        }
        if (uptime != 1) {
            unit = unit + 's';
        }

        uptime = uptime + ' ' + unit;
        return uptime;
    },
    getMMDDYYYY: function getMMDDYYYY() {
        var today = new Date();
        var dd = today.getDate();
        var mm = today.getMonth()+1; //January is 0!

        var yyyy = today.getFullYear();
        if(dd<10){
            dd='0'+dd
        }
        if(mm<10){
            mm='0'+mm
        }
        //var today = dd+'/'+mm+'/'+yyyy;
        return {
            mm : mm,
            dd : dd,
            yyyy : yyyy
        }
    }

};