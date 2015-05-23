//
// when the document is ready the callback will be triggered
//
$(document).ready(function () {
  /* TS = THINK SPEAK, AKA ask ashley */

  //
  // the domain for think speak
  //
  var TS_DOMAIN = "https://api.thingspeak.com/";

  //
  // desired thingspeak fields
  //
  var TS_FIELDS = ['field1', 'field4']

  //
  // nvd3 line chart
  //
  var lineChart = (function () {
    var chart = nv.models.lineChart().useInteractiveGuideline(true);

    // setup the x axis
    chart.xAxis.axisLabel('Time').tickFormat(function (d) {
      // format the date
      return d3.time.format('%H:%M')(new Date(d));
    });

    // setup the y axis
    chart.yAxis.axisLabel('Temp (C)').tickFormat(d3.format('.1f'));

    // will allegedly update the graph on window resize...
    nv.utils.windowResize(chart.update);

    return chart;
  }());

  //
  // a function for parsing dates in to strings
  //
  var parseDateStr = d3.time.format.utc('%Y-%m-%dT%H:%M:%SZ').parse;

  //
  // parses data into a format more suitable for nvd3
  //
  function toNvLineChart(tsData) {
    var d, f, i, len, results;
    results = [];
    for (i = 0, len = TS_FIELDS.length; i < len; i++) {
      f = TS_FIELDS[i];
      results.push({
        key: tsData.channel[f],
        values: (function() {
          var j, len1, ref, results1;
          ref = tsData.feeds;
          results1 = [];
          for (j = 0, len1 = ref.length; j < len1; j++) {
            d = ref[j];
            results1.push({
              x: parseDateStr(d.created_at),
              y: parseFloat(d[f])
            });
          }
          return results1;
        })()
      });
    }
    return results;
  }

  //
  // redraws
  //
  function redraw (chart, data) {
    return d3.select('#example-chart').datum(data).call(chart);
  }

  //
  // YAY GLOBALS, PS if you come up with a better way of
  // abstracting this state go with that, this is just an
  // example
  //
  var n = 100;
  var data = [{'key': 'No Data', 'values': [{x: 0, y: 0}]}];
  var interval = 16000;
  var duration = 1000;
  var channel = 17393;
  var oldlast = 0;

  //
  // I'm sure you can figure this one our your self,
  // I'm too tired to write helpful comments anymore
  //
  function handleData(newdata, chart) {
    var newdata = toNvLineChart(newdata);
    console.debug(newdata);
    var field1 = newdata[0];
    var last = field1.values[field1.values.length-1];
    if (last !== oldlast) {
      oldlast = last;
      data = newdata;
      var currentText = "Current " + field1.key + ": " + last.y.toString();
      $("#example-current-value").text(currentText);
      redraw(chart, newdata);
    }
  }

  //
  // will get called on each draw
  //
  function update (chart) {
    var jsonURL = TS_DOMAIN + ("channels/" + channel + "/feed.json?results=" + n);
    //
    // fetches json from the specied url
    //
    $.getJSON(jsonURL, function(data) {
      return handleData(data, chart);
    });
  };

  // //
  // // do the initial draw of the chart
  // //
  // update(lineChart);

  // //
  // // will continious redraw chart
  // //
  // setInterval(function () {
  //   update(lineChart);
  // }, interval);

});
