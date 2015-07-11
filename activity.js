var file;
var pv = "rank"; // #do not change this
var rk = "activity"; /// #do not change this
var format = "json";
var rs = "hour"; //#hour or minute (tip:use minute if you are going to plot only few weeks of data)
var rb = "2015-06-01"; // #yyyy-mm-dd from
var re = "2015-06-30"; // #to
var key = "B63eVVR2RIGTJ4dzFQtUbvVXBLY71hPip0wuQIDh"; //#your (looong) API key generated in the Embed and Data API ->
// Setup Data API
var sUrl = "http://www.rescuetime.com/anapi/data?key=" + key + "&perspective=" + pv + "&restrict_kind=" + rk + "&interval=" + rs + "&restrict_begin=" + rb + "&restrict_end=" + re + "&format=json";
console.log(sUrl);
$.getJSON('http://allow-any-origin.appspot.com/' + sUrl, function(data) {
    if (typeof data.rows === 'undefined') {
        console.log("undefined: maybe invalid parameters?");
    } else {
        drawChart(data);
    }
}).fail(function() {
    console.log("json failed!");
});
/*var arrayA = [1, 2];
                var arrayB = [3, 4];  
                var newArray = arrayA.concat(arrayB);*/
var tmp = 0;
var mins = 0;

function drawChart(file) {
    console.log("fatto:");
    var Combined = new Array();
    var color;
    Combined[0] = ['Results', 'First', {
        role: 'style'
    }, ];
    for (var i = 0; i < 100; i++) {
        switch (file.rows[i][5]) {
            case -2:
                color = "#F44336";
                break;
            case -1:
                color = "#FFC107";
                break;
            case 0:
                color = "#9E9E9E";
                break;
            case 1:
                color = "#8BC34A";
                break;
            case 2:
                color = "#4CAF50";
                break;
        }
        var tmp = file.rows[i][1];
        var mins = tmp / 60;
        Combined[i + 1] = [file.rows[i][3], mins, color];
    }
    console.log(Combined);
    //second parameter is false because first row is headers, not data.
    var data = google.visualization.arrayToDataTable(Combined, false);
    var options = {
        title: 'Company Performance',
        //
        legend: {
            position: 'bottom'
        },
        trendlines: {
            0: {
                type: 'linear',
                color: '#333',
                opacity: 1
            }
        }
    };
    var chart = new google.visualization.ColumnChart(document.getElementById('curve_chart'));
    chart.draw(data, options);
}