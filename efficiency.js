var pv = "interval"; // #do not change this
var rk = "efficiency"; /// #do not change this
var format = "json";
var rs = "week"; //#hour or minute (tip:use minute if you are going to plot only few weeks of data)
var rb = "2015-06-01"; // #yyyy-mm-dd from
var re = "2015-06-30"; // #to 
var key = "B63eVVR2RIGTJ4dzFQtUbvVXBLY71hPip0wuQIDh"; //#your (looong) API key generated in the Embed and Data API -> Setup Data API
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
var tmp = [];

function drawChart(file) {
    console.log(file.rows[0]);
    var Combined = new Array();
    Combined[0] = ['Results', 'First'];
    for (var i = 0; i < file.rows.length; i++) {
        Combined[i + 1] = [i, file.rows[i][4]];
    }
    console.log(Combined);
    //second parameter is false because first row is headers, not data.
    var data = google.visualization.arrayToDataTable(Combined, false);
    var options = {
        title: 'Company Performance',
        crosshair: {
            trigger: 'both'
        }, // Display crosshairs on focus and selection.
        legend: {
            position: 'bottom'
        },
        trendlines: {
            0: {
                type: 'polynomial',
                degree: 7,
                color: '#333',
                opacity: 1
            }
        }
    };
    var chart = new google.visualization.LineChart(document.getElementById('curve_chart'));
    chart.draw(data, options);
}