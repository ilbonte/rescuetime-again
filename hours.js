 console.log("asd");
 $(".loading").show();
 var pv = "interval", // #do not change this
     rk = "efficiency", /// #do not change this
     format = "json",
     rs = "hour", //#hour or minute (tip:use minute if you are going to plot only few weeks of data)
     rb = "2015-05-01", // #yyyy-mm-dd from
     re = "2015-05-31", // #to
     key = "B63eVVR2RIGTJ4dzFQtUbvVXBLY71hPip0wuQIDh"; //#your (looong) API key generated in the Embed and Data API -> Setup Data API
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
 // Set a 5-second (or however long you want) timeout to check for errors
 function drawChart(file) {
   var combinedPoints = new Array();
   var groupBy = new Array();
   var combinedAvg = new Array();
   var plotAvg = new Array();
   combinedPoints[0] = ['Hour', 'Productivity'];
   for (var i = 0; i < file.rows.length; i++) {
       combinedPoints[i + 1] = [parseInt(file.rows[i][0].substr(11, 2)), file.rows[i][4]];
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
       title: 'Productivity for hour',
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
       crosshair: {
           trigger: 'selection'
       }
   };
   $(".loading").hide();
   var chart = new google.visualization.ScatterChart(document.getElementById('curve_chart'));
   var avgChart = new google.visualization.LineChart(document.getElementById('avg_chart'));
   chart.draw(data, options);
   avgChart.draw(avgData, avgOptions);
}
 //This function groups the data for every hour in an array
 function filter(arr, cond) {
   return arr.filter(function(element) {
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