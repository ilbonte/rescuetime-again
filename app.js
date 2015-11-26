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


var degreeTrend = 10;
var key = "",
    rb = "",
    re = "",
    pv = "",
    rk = "",
    rs = "hour",
    format = "json";
var activityUrl = "",
    efficiencyUrl = "";
var failCount = 0;
var usingFiles = false;
var topAct = 50;
google.charts.load('43', {
    'packages': ['corechart', 'table', 'gauge', 'controls']
});
$(".spinner").hide();

function init() {
    usingFiles = false;
    $("#downloadSection").empty();
    $("#act-display").empty();
    $(".spinner").show();
    key = document.getElementById('api_key').value;
    rb = document.getElementById('from').value;
    re = document.getElementById('to').value;
    urlForEfficiency();
    getEfficiencyData();
    urlForActivity();
    getActivityData();
}


function datePickerOptions() {

    $('#datepicker').datepicker({
        format: "yyyy-mm-dd",
        clearBtn: true,
        todayHighlight: true
    });
}


var efficencyUploaded;
var activityUploaded;
(function () {

    function onChangeEfficency(event) {
        var reader = new FileReader();
        reader.onload = onReaderLoadEfficency;
        reader.readAsText(event.target.files[0]);

    }

    function onReaderLoadEfficency(event) {
        efficencyUploaded = JSON.parse(event.target.result);
        console.log(efficencyUploaded);
    }

    function onChangeActivity(event) {
        var reader = new FileReader();
        reader.onload = onReaderLoadActivity;
        reader.readAsText(event.target.files[0]);

    }

    function onReaderLoadActivity(event) {
        activityUploaded = JSON.parse(event.target.result);
        console.log(activityUploaded);
    }

    document.getElementById('fileEfficency').addEventListener('change', onChangeEfficency);
    document.getElementById('fileActivity').addEventListener('change', onChangeActivity);
}());

function checkFiles() {
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

function urlForEfficiency() {
    pv = "interval"; // #do not change this
    rk = "efficiency";
    efficiencyUrl = "http://www.rescuetime.com/anapi/data?key=" + key + "&perspective=" + pv + "&restrict_kind=" + rk + "&interval=" + rs + "&restrict_begin=" + rb + "&restrict_end=" + re + "&format=json";
    console.log(efficiencyUrl);
}

function urlForActivity() {
    pv = "rank"; // #do not change this
    rk = "activity";
    activityUrl = "http://www.rescuetime.com/anapi/data?key=" + key + "&perspective=" + pv + "&restrict_kind=" + rk + "&interval=" + rs + "&restrict_begin=" + rb + "&restrict_end=" + re + "&format=json";
    console.log(activityUrl);
}


function getEfficiencyData() {

    $.getJSON('http://allow-any-origin.appspot.com/' + efficiencyUrl, function (data) {
        if (typeof data.rows === 'undefined') {
            console.log("undefined: maybe invalid parameters!?");
        } else {
            calcEfficiency(data);
            calcHours(data);
            if (document.getElementById('download').checked) {

                downloadEfficiencyData(data);
            }
        }
    }).fail(function () {
        failCount++;
        if (failCount < 3) {
            console.log("failed in getEfficiencyData");
            init();
        } else console.log("Failed 3 times attempting to: getJSON!");
    });
}

function getActivityData() {
    $.getJSON('http://allow-any-origin.appspot.com/' + activityUrl, function (data) {
        if (typeof data.rows === 'undefined') {
            console.log("undefined: maybe invalid parameters!?");
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
            init();
        } else console.log("Failed 3 times attempting to: getJSON!");
    });
}

function downloadEfficiencyData(data) {
    var JSONString = JSON.stringify(data);
    var file = "text/json;charset=utf-8," + encodeURIComponent(JSONString);

    $('<a href="data:' + file + '" download="EfficiencyData.json" id="downEfficency">downloadEfficiencyData</a> <br>').appendTo('#downloadSection');
    //$('#downEfficency').get(0).click();
}

function downloadActivityData(data) {
    var JSONString = JSON.stringify(data);
    var file = "text/json;charset=utf-8," + encodeURIComponent(JSONString);
    $('<a href="data:' + file + '" download="ActivityData.json" id="downEfficency">downloadActivityDataa</a> <br>').appendTo('#downloadSection');
    //$('#downEfficency').get(0).click();
}

function calcEfficiency(file) {

    var Combined = [];
    Combined[0] = ['Hours', 'Productivity'];
    for (var i = 0; i < file.rows.length; i++) {
        Combined[i + 1] = [new Date(file.rows[i][0]), file.rows[i][4]];
    }

    degreeTrend = parseInt(document.getElementById("numberSpinner").value);
    //second parameter is false because first row is headers, not data.
    var data = google.visualization.arrayToDataTable(Combined, false);
    var options = {
        height: 600,
        title: 'Productivity for the selected range',
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

function updateProdTrend() {
    if (efficencyUploaded != null && usingFiles)
        calcEfficiency(efficencyUploaded);
    if (!usingFiles)
        getEfficiencyData();

}

function calcHours(file) {
    var combinedPoints = [];
    var groupBy = [];
    var combinedAvg = [];
    var plotAvg = [];
    combinedPoints[0] = ['Hour', 'Productivity'];
    console.log("debg");
    for (var i = 0; i < file.rows.length; i++) {
        combinedPoints[i + 1] = [parseInt(file.rows[i][0].substr(11, 2)), file.rows[i][4]];//note: I can't use Date()
    }
    for (var i = 0; i < 24; i++) {
        groupBy[i] = filter(combinedPoints, i);
    }
    for (var i = 0; i < 24; i++) {
        combinedAvg[i] = [i, findAvg(groupBy[i])];
    }
    //second parameter is false because first row is headers, not data.
    var data = google.visualization.arrayToDataTable(combinedPoints, false);
    var avgData = google.visualization.arrayToDataTable(combinedAvg, true);
    var options = {
        title: 'Productivity for hour',
        'height': 600,
        hAxis: {
            title: 'Hour',
            gridlines: {
                count: 24
            }
        },
        vAxis: {
            title: 'Productivity',
            minValue: 0
        },
        legend: {
            position: 'bottom'
        }
    };
    var avgOptions = {
        title: 'Your average pro through the day',
        'height': 600,
        curveType: 'function',
        hAxis: {
            title: 'Hour',
            gridlines: {
                count: 24
            }
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
    var avgChart = new google.visualization.LineChart(document.getElementById('avg_hour_graph'));
    var chart = new google.visualization.ScatterChart(document.getElementById('hour_graph'));
    $(".spinner").hide();
    avgChart.draw(avgData, avgOptions);
    chart.draw(data, options);
}

//This function groups the data for every hour in an array
function filter(arr, cond) {
    return arr.filter(function (element) {
        return element[0] === cond;
    });
}

//This function finds the average productivity for an hour. (Is executed 24 times)
function findAvg(arr) {
    var length = arr.length;
    var avg;
    var sum = 0;
    for (var i = 0; i < length; i++) {
        sum += arr[i][1];
    }
    avg = sum / length;
    return avg;
}

function calcActivity(file) {
    var Combined = [];
    var color;
    Combined[0] = ['Results', 'Select the range', {
        role: 'style'
    }];
   // topAct = parseInt(document.getElementById("numberSpinnerTop"));
    // TODO: fixthis
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
        //todo: inseire tempo formattato
        var mins = tmp / 60;
        Combined[i + 1] = [file.rows[i][3], mins, color];
    }
    groupByCategory(file);
    //second parameter is false because first row is headers, not data.
    var data = google.visualization.arrayToDataTable(Combined, false);
    var dashboard = new google.visualization.Dashboard(document.getElementById('act-numberRangeFilter_dashboard_div'));
    var control = new google.visualization.ControlWrapper({
        'controlType': 'NumberRangeFilter',
        'containerId': 'act-numberRangeFilter_control_div',
        'options': {
            'filterColumnIndex': 1,
            'minValue': Combined[topAct][1],
            'maxValue': Combined[1][1]
        }
    });
    var chart = new google.visualization.ChartWrapper({
        'chartType': 'BarChart',
        'containerId': 'act-numberRangeFilter_chart_div',
        'options': {
            'height': 900,
            'legend': 'none',
            'chartArea': {
                'width': '75%',
                'height': '90%'
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

function printInfo(distracting, neutral, productive) {
    var summaryText = $('#act-display');

    summaryText.append('<h3> Total productive time: ' + productive.toHHMMSS() + " <div style=' width: 18px; height: 18px;background: #2F78BD;display: inline-block;'></div> + <div style='width: 18px; height: 18px; background: #395B96; display: inline-block;'></div> </h3> ");
    summaryText.append("<h3> Total neutral time: " + neutral.toHHMMSS() + "<div style='width: 18px; height: 18px; background: #655568; display: inline-block;'></div> </h3> ");
    summaryText.append("<h3> Total distracting time: " + distracting.toHHMMSS() + "<div style=' width: 18px; height: 18px;background: #C5392F;display: inline-block;'></div> + <div style='width: 18px; height: 18px; background: #92343B; display: inline-block;'></div></h3>");
}


Number.prototype.toHHMMSS = function () {
    var numdays = Math.floor(this / 86400);

    var numhours = Math.floor((this % 86400) / 3600);

    var numminutes = Math.floor(((this % 86400) % 3600) / 60);

    var numseconds = ((this % 86400) % 3600) % 60;

    return numdays + " days " + numhours + " hours " + numminutes + " minutes " + numseconds + " seconds";

};


function updateTopAct() {
    //TODO: FIX= potrei aver caricato solo un file e  non tutti e due ma usingfiles potrebbe essere comunque a true
    if (activityUploaded != null && usingFiles)
        calcActivity(activityUploaded);
    if (!usingFiles)
        getActivityData();
}