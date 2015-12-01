/*https://developers.google.com/chart/interactive/docs/library_loading_enhancements#frozen-versions
 * init()
 *   urlForEfficiency() //create url based on parameters
 *   getEfficiencyData()//get json obj
 *       calcEfficiency()
 *       calcHours()
 *          filter()
 *          findAvg()
 *       downloadEfficiencyData()
 *
 *
 *   urlForActivity()
 *   getActivityData()
 *      calcActivity()
 *          groupByCategory()
 *              printInfo()
 *                  .toHHMMSS
 *
 *      downloadActivityData()
 * updateProdTrend()
 * datePickerOptions()
 * */

/**
 * NOTE: below I'm using efficiency and productivity as synonymous
 * See here for full reference: https://www.rescuetime.com/apidoc#analytic-api-reference
 * 'key' is the user API KEY
 * 'rb' Sets the start day for data batch
 * 're' Sets the end day for data batch,
 * 'pv' Perspective: rank: (default) Organized around a calculated value, usually a sum like time spent
 *                   interval: Organized around calendar time.
 * 'rk' Restrict kind:
 *                    overview: sums statistics for all activities into their top level category
 *                    category: sums statistics for all activities into their sub category
 *                    activity: sums statistics for individual applications / web sites / activities
 *                    productivity: productivity calculation
 *                    efficiency: efficiency calculation (not applicable in "rank" perspective)
 *                    document: sums statistics for individual documents and web pages
 * 'rs' Resolution time: Default is "hour". In an interval report, the X axis unit. In other words, data is summarizd into chunks of this size. "minute" will return data grouped into five-minute buckets, which is the most granular view available.
 *
 * */
var key = "",
    rb = "",
    re = "",
    pv = "",
    rk = "",
    rs = "hour";

//Urls the are constructed based on user choices
var activityUrl = "",
    efficiencyUrl = "";
//Number of fails when attempting to 'download' the JSON.
var failCount = 0;
//True if the user uploaded his own JSON
var usingFiles = false;

var efficencyUploaded,
    activityUploaded;
//Are the parameters that are modified when the unit is changed in the dropdown menu for the activity chart
var unit = 60,
    unitText = "Minutes";


google.charts.load('43', {
    'packages': ['corechart', 'table', 'gauge', 'controls', 'bar', 'line']
});


$(".spinner").hide();
$(".chart").hide();

/**
 * Is called when the user choose to retrieve the data via HTTP request
 * */
function init() {
    key = document.getElementById('api_key').value;
    rb = document.getElementById('from').value;
    re = document.getElementById('to').value;
    if (key.length > 5) {
        usingFiles = false;
        $("#downloadSection").empty();
        $(".spinner").show();
        $(".chart").show();

        urlForEfficiency();
        getEfficiencyData();
        urlForActivity();
        getActivityData();
    }
    else
        alert("Please insert your api key");
}

/**
 * Create the URL for the HTTP request with 'rk=efficiency'
 * */
function urlForEfficiency() {
    pv = "interval"; // do not change this
    rk = "efficiency";
    efficiencyUrl = "http://www.rescuetime.com/anapi/data?key=" + key + "&perspective=" + pv + "&restrict_kind=" + rk + "&interval=" + rs + "&restrict_begin=" + rb + "&restrict_end=" + re + "&format=json";
    console.log(efficiencyUrl);
}
/**
 * Create the URL for the HTTP request with  'rk =activity'
 * */
function urlForActivity() {
    pv = "rank"; //do not change this
    rk = "activity";
    activityUrl = "http://www.rescuetime.com/anapi/data?key=" + key + "&perspective=" + pv + "&restrict_kind=" + rk + "&interval=" + rs + "&restrict_begin=" + rb + "&restrict_end=" + re + "&format=json";
    console.log(activityUrl);
}

/**
 * Get the efficiency (aka productivity) data and starts the functions for creating the related charts
 */

function getEfficiencyData() {
    //bypassing Access-Control-Allow-Origin stuff
    $.getJSON('http://allow-any-origin.appspot.com/' + efficiencyUrl, function (data) {
        if (typeof data.rows === 'undefined') {
            alert("Oh no! Something has gone wrong! Is your apikey valid? ");
        } else {
            calcEfficiency(data);
            calcHours(data);
            console.log(data);
            if (document.getElementById('download').checked) {

                downloadEfficiencyData(data);
            }
        }
    }).fail(function () {
        failCount++;
        if (failCount < 3) {
            console.log("failed in getEfficiencyData");
            setTimeout(init(), failCount * 100);
        } else console.log("Failed 3 times attempting to: getEfficiencyData!");
    });
}

/**
 * Get the data for creating the activities chart
 */

function getActivityData() {
    $.getJSON('http://allow-any-origin.appspot.com/' + activityUrl, function (data) {
        if (typeof data.rows === 'undefined') {
            alert("Oh no! Something has gone wrong! Is your apikey valid? ");
        } else {
            calcActivity(data);
            if (document.getElementById('download').checked) {
                downloadActivityData(data);
            }
        }
    }).fail(function () {
        failCount++;
        if (failCount < 3) {
            console.log("failed in getEfficiencyData");
            setTimeout(init(), failCount * 100);
        } else console.log("Failed 3 times attempting to: getActivityData!");
    });
}

/**
 * Create and start the download for the efficiency file
 * */

function downloadEfficiencyData(data) {
    var JSONString = JSON.stringify(data);
    var file = "text/json;charset=utf-8," + encodeURIComponent(JSONString);
    $('<a href="data:' + file + '" download="EfficiencyData' + rb + ' to ' + re + '.json" id="downEfficency">Download Efficiency Data</a> <br>').appendTo('#downloadSection');
    $('#downEfficency').get(0).click();
}
/**
 * Create and start the download for the activities  file
 * */
function downloadActivityData(data) {
    var JSONString = JSON.stringify(data);
    var file = "text/json;charset=utf-8," + encodeURIComponent(JSONString);
    $('<a href="data:' + file + '" download="ActivityData' + rb + ' to ' + re + '.json" id="downActivity">Download Activity Data</a> <br>').appendTo('#downloadSection');
    $('#downActivity').get(0).click();
}

/**
 *Starting from a file (both uploaded or retrieved via HTTP) create the first chart.
 */

function calcEfficiency(file) {

    var Combined = [];
    Combined[0] = ['Hours', 'Productivity'];
    /**Get the degree of the trendline*/
    var degreeTrend = parseInt(document.getElementById("numberSpinner").value);

    for (var i = 0; i < file.rows.length; i++) {
        if (document.getElementById("showDates").checked)
            Combined[i + 1] = [new Date(file.rows[i][0]), (file.rows[i][4] * file.rows[i][1]) / 3600]; //"normalized"
        else
            Combined[i + 1] = [i, (file.rows[i][4] * file.rows[i][1]) / 3600];

    }

    //second parameter is false because first row is headers, not data.
    var data = google.visualization.arrayToDataTable(Combined, false);
    var options = {
        height: 600,
        title: 'Productivity for the selected range',
        'theme': 'material',
        vAxis: {
            title: 'Productivity',
            titleTextStyle: {
                color: '#FF0000'
            }
        },
        hAxis: {
            title: 'Time',
            titleTextStyle: {
                color: '#FF0000'
            }

        },
        crosshair: {
            trigger: 'both'
        }, // Display cross-air on focus and selection.
        legend: {
            position: 'top'
        },
        trendlines: {
            0: {
                type: 'polynomial',
                degree: degreeTrend,
                color: '#1c91c0',
                lineWidth: 5,

                opacity: 1
            }
        },
        series: {
            0: {
                color: '#F6C5BA',
                opacity: 0.5
            }
        },
        animation: {
            duration: 500,
            startup: true,
            easing: 'in'
        }

    };

    var chart = new google.visualization.LineChart(document.getElementById('efficiency_graph'));
    chart.draw(data, options);
}

/**
 * Reloads the first chart when the user change from points to Date or vice versa
 * */
function updateProd() {
    if (efficencyUploaded != null && usingFiles)
        calcEfficiency(efficencyUploaded);
    if (!usingFiles)
        getEfficiencyData();
}
/**
 * Elaborate the data and create the graphs related to the productivity
 * */
function calcHours(file) {

    var combinedPointsHourEfficiency = [],
        combinedPointsHours = [],
        comboHours = [];

    var combinedPointsDayEfficiency = [],
        combinedPointsDay = [],
        comboDay = [];

    var groupEfficiencyByHour = [],
        groupByHours = [],
        groupEfficiencyByDay = [],
        groupByDay = [];


    var combinedAvg = [],
        combinedAvgDay = [],
        combinedSumHours = [],
        combinedSumDay = [];


    combinedPointsHourEfficiency[0] = ['Hour', 'Productivity'];
    combinedPointsHours[0] = ['Hour', 'Total Time'];
    comboHours[0] = ['Hour', 'Productivity', 'Total Time'];

    combinedPointsDayEfficiency[0] = ['Day', 'Productivity'];
    combinedPointsDay[0] = ['Hour', 'Total Time'];
    comboDay[0] = ['Hour', 'Productivity', 'Total Time'];


    var dateString;
    for (var i = 0; i < file.rows.length; i++) {
        dateString = file.rows[i][0];
        combinedPointsHourEfficiency[i + 1] = [parseInt(dateString.substr(11, 2)), (file.rows[i][4] * file.rows[i][1]) / 3600];//note: I can't use Date() because rescuetime log the date based on user's system time which is in GMT but when using Date() on the string in the JSON is converted in UTC
        combinedPointsHours[i + 1] = [parseInt(dateString.substr(11, 2)), file.rows[i][1]];


        combinedPointsDayEfficiency[i + 1] = [new Date(dateString.substr(0, 10)).getDay(), (file.rows[i][4] * file.rows[i][1]) / 3600];
        combinedPointsDay[i + 1] = [new Date(dateString.substr(0, 10)).getDay(), file.rows[i][1]];

    }
    for (var i = 0; i < 24; i++) {
        groupEfficiencyByHour[i] = filter(combinedPointsHourEfficiency, i);
        groupByHours[i] = filter(combinedPointsHours, i);
    }
    for (var i = 0; i < 7; i++) {
        groupEfficiencyByDay[i] = filter(combinedPointsDayEfficiency, i);
        groupByDay[i] = filter(combinedPointsDay, i);
    }


    for (var i = 0; i < 24; i++) {
        combinedSumHours[i] = [i, findSum(groupByHours[i]) / 3600];
        combinedAvg[i] = [i, findAvg(groupEfficiencyByHour[i])];
        comboHours[i] = [i, combinedAvg[i][1], combinedSumHours[i][1]];
    }
    for (var i = 0; i < 7; i++) {
        combinedSumDay[i] = [i, findSum(groupByDay[i]) / 3600];
        combinedAvgDay[i] = [i, findAvg(groupEfficiencyByDay[i])];
        comboDay[i] = [i, combinedAvgDay[i][1], combinedSumDay[i][1]];
    }
    console.log(comboHours);


    //second parameter is false because first row is headers, not data.
    var avgData = google.visualization.arrayToDataTable(combinedAvg, true);
    //var hoursData = google.visualization.arrayToDataTable(combinedSumHours, true);
    var comboHoursData = google.visualization.arrayToDataTable(comboHours, true);

    var avgDayData = google.visualization.arrayToDataTable(combinedAvgDay, true);
    //var dayData = google.visualization.arrayToDataTable(combinedSumDay, true);
    var comboDayData = google.visualization.arrayToDataTable(comboDay, true);


    var avgOptions = {
        title: 'Your average productivity by hour during the day',
        'height': 600,
        'theme': 'material',
        curveType: 'function',
        hAxis: {

            title: 'Hour',
            gridlines: {
                count: 24
            },
            showTextEvery: 1

        },
        vAxis: {
            title: 'Productivity',
            minValue: 0
        },
        animation: {
            duration: 500,
            startup: true,
            easing: 'in'
        },
        legend: {
            position: 'none'
        },
        crosshair: {
            trigger: 'selection'
        }
    };


    var comboHourOptions = {
        title: 'Total Time vs Productivity',
        'theme': 'material',
        'height': 300,
        // multiple axis (you can have different labels, colors, etc.)
        vAxes: [
            {title: "Total Time", textStyle: {color: "red"},
                minValue: 0},
            {title: "Productivity", textStyle: {color: "blue"},
                minValue: 0}

        ],
        hAxis: {
            title: "Hour of day", gridlines: {
                count: 24
            }
        },
        seriesType: "bars",
        // 1st series on axis 0 (by default), 2nd series on axis 1
        series: {0: {type: "line", targetAxisIndex: 1, curveType: 'function'}}
    };
    var avgDayOptions = {
        chart: {
            title: 'productivity by day of week',
            subtitle: '0=Sunday, 6=Saturday'
        },
        'height': 600,
        curveType: 'function',
        'theme': 'material',
        hAxis: {
            title: 'Days',
            ticks: [{v: 0, f: 'Sunday'}, {v: 1, f: 'Monday'}, {v: 2, f: 'Tuesday'}, {v: 3, f: 'Wednesday'}, {
                v: 4,
                f: 'Thursday'
            }, {v: 5, f: 'Friday'}, {v: 6, f: 'Saturday'}],
            gridlines: {
                count: 7
            }

        },
        legend: {
            position: 'none'
        },
        vAxis: {
            title: 'Productivity logged'
        }
    };

    var comboDayOptions = {
        title: 'Total Time vs Productivity',
        'height': 300,
        'theme': 'material',
        // multiple axis (you can have different labels, colors, etc.)
        vAxes: [
            {title: "Total Time", textStyle: {color: "red"},
                minValue: 0},
            {title: "Productivity", textStyle: {color: "blue"},
                minValue: 0}
        ],
        hAxis: {
            title: "Day of week",
            ticks: [{v: 0, f: 'Sunday'}, {v: 1, f: 'Monday'}, {v: 2, f: 'Tuesday'}, {v: 3, f: 'Wednesday'}, {
                v: 4,
                f: 'Thursday'
            }, {v: 5, f: 'Friday'}, {v: 6, f: 'Saturday'}]
        },
        seriesType: "bars",
        // 1st series on axis 0 (by default), 2nd series on axis 1
        series: {0: {type: "line", targetAxisIndex: 1, curveType: 'function'}}
    };
    var avgChart = new google.visualization.LineChart(document.getElementById('avg_hour_graph'));
    //var hoursChart = new google.visualization.ColumnChart(document.getElementById('sum_hour_graph'));
    var comboHoursChart = new google.visualization.ComboChart(document.getElementById('combo_hour_graph'));


    var avgDayChart = new google.visualization.LineChart(document.getElementById('avg_day_graph'));
    //var daysChart = new google.visualization.ColumnChart(document.getElementById('sum_day_graph'));
    var comboDayChart = new google.visualization.ComboChart(document.getElementById('combo_day_graph'));


    $(".spinner").hide();
    avgChart.draw(avgData, avgOptions);
    //hoursChart.draw(hoursData, hoursOptions);
    comboHoursChart.draw(comboHoursData, comboHourOptions);

    avgDayChart.draw(avgDayData, avgDayOptions);
    //daysChart.draw(dayData, dayOptions);
    comboDayChart.draw(comboDayData, comboDayOptions);
}

/**
 * Extracts the selected value from the array
 */
function filter(arr, cond) {
    return arr.filter(function (element) {
        return element[0] === cond;
    });
}

/**
 * Computes the sum of the time
 */
function findSum(arr) {
    var sum = 0;
    for (var i = 0; i < arr.length; i++) {
        sum += arr[i][1];
    }
    return sum;
}
/**
 * Computes the average time
 */
function findAvg(arr) {
    avg = findSum(arr) / arr.length;
    //TODO: maybe is better use the time instead of the number of the points
    return avg;
}

/**
 * Create the chart for the activities
 */
function calcActivity(file) {
    $("#act-display").empty();

    var topAct = document.getElementById("numberSpinnerTop").value;

    var Combined = [];
    var color;
    Combined[0] = ['Results', unitText, {
        role: 'style'
    }];

    for (var i = 0; i < topAct; i++) {
        switch (file.rows[i][5]) {
            case -2:
                color = "#C5392F";
                break;
            case -1:
                color = "#92343B";
                break;
            case 0:
                color = "#655568";
                break;
            case 1:
                color = "#395B96";
                break;
            case 2:
                color = "#2F78BD;";
                break;
        }
        var tmp = file.rows[i][1];
        Combined[i + 1] = [file.rows[i][3], tmp / unit, color];
    }
    groupByCategory(file);
    //second parameter is false because first row is headers, not data.
    var data = google.visualization.arrayToDataTable(Combined, false);
    var dashboard = new google.visualization.Dashboard(document.getElementById('act-numberRangeFilter_dashboard_div'));
    var control = new google.visualization.ControlWrapper({
        controlType: 'NumberRangeFilter',
        containerId: 'act-numberRangeFilter_control_div',
        options: {
            filterColumnIndex: 1,
            minValue: Combined[topAct][1],
            maxValue: Combined[1][1]
        }
    });
    var chart = new google.visualization.ChartWrapper({
        chartType: 'BarChart',
        containerId: 'act-numberRangeFilter_chart_div',

        options: {
            'theme': 'material',
            height: 900,
            legend: 'none',
            chartArea: {
                width: '75%',
                height: '90%'
            },
            vAxis: {
                textStyle: {
                    color: 'black',
                    fontSize: '12',
                    paddingRight: '100',
                    marginBottom: '100',
                    marginRight: '100'
                }
            }
        }
    });
    dashboard.bind(control, chart);
    dashboard.draw(data);

}

/**
 * Groups the time by category
 */
function groupByCategory(file) {
    var distracting = 0,
        neutral = 0,
        productive = 0;
    var totalRows = file.rows.length;
    for (var i = 0; i < totalRows; i++) {
        if (file.rows[i][5] === -2 || file.rows[i][5] === -1) {
            distracting += parseInt(file.rows[i][1]);
        }
        if (file.rows[i][5] === 1 || file.rows[i][5] === 2) {
            productive += parseInt(file.rows[i][1]);
        }
        if (file.rows[i][5] === 0) {
            neutral += parseInt(file.rows[i][1]);
        }
    }
    printInfo(distracting, neutral, productive);
}
/**
 * Prints summary text for the activities
 * */
function printInfo(distracting, neutral, productive) {
    var summaryText = $('#act-display');

    summaryText.append('<h3> Total productive time: ' + productive.toHHMMSS() + " <div style=' width: 18px; height: 18px;background: #2F78BD;display: inline-block;'></div> + <div style='width: 18px; height: 18px; background: #395B96; display: inline-block;'></div> </h3> ");
    summaryText.append("<h3> Total neutral time: " + neutral.toHHMMSS() + "<div style='width: 18px; height: 18px; background: #655568; display: inline-block;'></div> </h3> ");
    summaryText.append("<h3> Total distracting time: " + distracting.toHHMMSS() + "<div style=' width: 18px; height: 18px;background: #C5392F;display: inline-block;'></div> + <div style='width: 18px; height: 18px; background: #92343B; display: inline-block;'></div></h3>");
}

/**
 * Helper for translating from second to an human-readable format
 * */
Number.prototype.toHHMMSS = function () {
    var numdays = Math.floor(this / 86400);

    var numhours = Math.floor((this % 86400) / 3600);

    var numminutes = Math.floor(((this % 86400) % 3600) / 60);

    var numseconds = ((this % 86400) % 3600) % 60;

    return numdays + " days " + numhours + " hours " + numminutes + " minutes " + numseconds + " seconds";

};

/**
 * Reload the activities' chart
 * */
function updateTopAct() {
    if (activityUploaded != null && usingFiles) {
        calcActivity(activityUploaded);
    }

    if (!usingFiles)
        getActivityData();
}

(function () {

    function onChangeEfficency(event) {
        var reader = new FileReader();
        reader.onload = onReaderLoadEfficency;
        reader.readAsText(event.target.files[0]);
    }

    function onReaderLoadEfficency(event) {
        efficencyUploaded = JSON.parse(event.target.result);
    }

    function onChangeActivity(event) {
        var reader = new FileReader();
        reader.onload = onReaderLoadActivity;
        reader.readAsText(event.target.files[0]);
    }

    function onReaderLoadActivity(event) {
        activityUploaded = JSON.parse(event.target.result);
    }

    $(".dropup li").on("click", function () {
        unit = this.value;
        unitText = $(this).text();
        updateTopAct();
    });

    $("#showDates").on("click", function () {
        updateProd();
    });

    document.getElementById('fileEfficency').addEventListener('change', onChangeEfficency);
    document.getElementById('fileActivity').addEventListener('change', onChangeActivity);
}());


/**
 * Settings fot the date picker
 * */
function datePickerOptions() {
    $('#datepicker').datepicker({
        format: "yyyy-mm-dd",
        clearBtn: true,
        todayHighlight: true
    });
}
/**
 * Draw the chart if there are the required data
 * */
function checkFiles() {
    $(".chart").show();
    usingFiles = true;
    $("#act-display").empty();
    if (efficencyUploaded != null) {
        calcEfficiency(efficencyUploaded);
        calcHours(efficencyUploaded);
    }
    if (activityUploaded != null) {
        calcActivity(activityUploaded);
    }
}

function screenShot() {
    html2canvas(document.getElementById('screen'), {
        onrendered: function (canvas) {
            var myImage = canvas.toDataURL("image/png");
            window.open(myImage);
        }
    });
}




