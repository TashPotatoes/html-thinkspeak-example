//
// when the document is ready the callback will be triggered
//
$(document).ready(function () {
  /* TS = THINK SPEAK, AKA ask ashley */

  //
  // the domain for think speak
  //


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

  var duration = 1000;

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



  function linearPlot(a, b) {
    var xa = a[0], ya = a[1]; 
    var xb = b[0], yb = b[1]; 
    var m = (yb - ya) / (xb - xa);
    return function (x) {
      return (m * (x - xa)) + ya;   
    };
  }

  function multiLinearPlot (lines) {
    var equations = []; // [(min, max, equation)] 
    var left, right, eq;

    var lastIndex = lines.length-2;

    var min = lines[0][0];
    var max = lines[lastIndex][0];

    for (var i = 0; i < lines.length-1; i++) {
      left  = lines[i]; 
      right = lines[i+1]; 
      eq    = linearPlot(left, right); 

      equations.push([left[0], right[0], eq]);
    }

    return function (x) {
      if (x >= min && max >= x) {
        var i, eq;
        for (i in equations) {
          eq = equations[i]; 
          if (!(x >= eq[0] && eq[1] >= x)) { continue; } 
          return eq[2](x);
        }
      }
      else if (x < min) {
        return equations[0][2](x);        
      }
      else if (x > max) {
        return equations[lastIndex][2](x);        
      }
    };
  }

  function colorCurve (colors) {
    var i, color;

    var rBuff = []; // [(Num, RNum)]
    var bBuff = []; // [(Num, BNum)]
    var gBuff = []; // [(Num, GNum)]

    for (i in colors) {
      color = colors[i];
      rBuff.push([color[0], color[1][0]]);
      gBuff.push([color[0], color[1][1]]);
      bBuff.push([color[0], color[1][2]]);
    }

    var r = multiLinearPlot(rBuff);
    var g = multiLinearPlot(gBuff);
    var b = multiLinearPlot(bBuff);

    return function (i) {
      return new net.brehaut.Color([r(i), g(i), b(i)]);
    };
  }


  //
  // will get called on each draw
  //
  function update () {
    var n = 200;
    var channel = 39055;
    var TS_DOMAIN = "https://api.thingspeak.com/";
    var jsonURL = TS_DOMAIN + ("channels/" + channel + "/feed.json?results=" + n);
    //
    // fetches json from the specied url
    //
    $.getJSON(jsonURL, function(data) {
      return updateVis(data.feeds[0]);
    });
  };


  var colours = colorCurve([
    [-20, [75, 178, 225]],
    [13, [250, 255, 161]],
    [60, [255, 90, 57]],
  ]);


  function updateVis (data) {
    console.log(Date.now(), data);
    var colorMap = [
      ['ground',       'field1'],
      ['log',          'field2'],
      ['treeBot', 'field3'],
      ['treeMid', 'field4'],
      ['treeTop', 'field5']
    ];
    int colindex = 0;
    colorMap.forEach(function (column) {

      var color = colours(data[column[1]]).toCSSHex();
    
      //if (color == 2 || or color == 3){
       // $('#'+column[0]).linear-gradient(data[column[1]]).toCSSHex(), data[colorMap[colIndex+1][column[1]]].toCSSHex(); //('fill', color);
      //}
      //colIndex++;                                                   

//      <stop offset="0%" style="stop-color:rgb(255,255,0);stop-opacity:1" />
//    <stop offset="100%" style="stop-color:rgb(255,0,0);stop-opacity:1" />

      $('#'+column[0]+'Temp').text(data[column[1]]+'°');
    });

    



  }


  $.get('assets/svg/ugly.svg', function (data) {
    $('.container').append(data.childNodes[1]);
    var interval = 16000;
    setInterval(update, interval);
    update();
  });

});
