// Various accessors that specify the four dimensions of data to visualize.
function x(d) { return d.x; }
function y(d) { return d.y; }
function radius(d) { return d.population; }
function color(d) { return d.region; }
function key(d) { return d.name; }

// Chart dimensions.
var margin = {top: 19.5, right: 19.5, bottom: 19.5, left: 39.5},
    width = 960 - margin.right,
    height = 500 - margin.top - margin.bottom;

// Various scales. These domains make assumptions of data, naturally.
var xScale = d3.scale.linear().domain([1965, 2000]).range([0, width]),
    yScale = d3.scale.log().domain([2e1, 120000]).range([height, 0]),
    radiusScale = d3.scale.sqrt().domain([0, 100000]).range([0, 70]),
    colorScale = d3.scale.category10();
	
//var newyscale = d3.scale.log().domain([2e1, 120000]).range([height, 0]).ticks();
//var newyscale = d3.svg.axis().scale(yScale).tickFormat(function (d) {
        //return s.tickFormat(4,d3.format(",d"))(d)
//})
// The x & y axes.
var xAxis = d3.svg.axis().orient("bottom").scale(xScale).ticks(12, d3.format(",d")),
    //yAxis = d3.svg.axis().scale(newyscale).orient("left");
	yAxis = d3.svg.axis().scale(yScale).orient("left")0.tickFormat(function (d) {
	        return yScale.tickFormat(4,d3.format(",d"))(d)
	});

// Create the SVG container and set the origin.
var svg = d3.select("#chart").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// Add the x-axis. Width of chart
svg.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + height + ")")
    .call(xAxis);

// Add the y-axis. Height of chart
svg.append("g")
    .attr("class", "y axis")
    .call(yAxis);

// Add an x-axis label.
/*svg.append("text")
    .attr("class", "x label")
    .attr("text-anchor", "end")
    .attr("x", width)
    .attr("y", height - 6)
    .text("income per capita, inflation-adjusted (dollars)");*/

// Add a y-axis label.
svg.append("text")
    .attr("class", "y label")
    .attr("text-anchor", "end")
    .attr("y", 6)
    .attr("dy", ".75em")
    .attr("transform", "rotate(-90)")
    .text("Region");

// Add the year label; the value is set on transition. The big date.
var label = svg.append("text")
    .attr("class", "year label")
    .attr("text-anchor", "end")
    .attr("y", height - 24)
    .attr("x", width)
    .text(1800);

// Load the data from the json file.
d3.json("../pop.json", function(nations) {

  // A bisector since many nation's data is sparsely-defined. Empty function
  var bisect = d3.bisector(function(d) { return d[0]; });

  // Add a dot per year.
  var dot = svg.append("g")
      .attr("class", "dots")
      .selectAll(".dot")
      //not exactly sure what interpolateData does
      .data(interpolateData(1000))
    .enter().append("circle")
      // just saying that "dot" is the name of the class. for css!
      .attr("class", "dot")
      // filling dot w/ color based on region attribute of object d
      .style("fill", function(d) { return colorScale(color(d)); })
      .call(position)
      .sort(order);
  // Add a title.
  /*dot.append("title")
      .text(function(d) { return d.name; });*/

  // Add an overlay for the year label.
  var box = label.node().getBBox();

  var overlay = svg.append("rect")
        .attr("class", "overlay")
        .attr("x", box.x)
        .attr("y", box.y)
        .attr("width", box.width)
        .attr("height", box.height)
        .on("mouseover", enableInteraction);

  // Start a transition that interpolates the data based on year.
  svg.transition()
      .duration(20000)
      .ease("linear")
      .tween("year", tweenYear)
      .each("end", enableInteraction);

  // Positions the dots based on data.
  var tooltip = d3.select("body")
          .append("div")
          .style("position", "absolute")
          .style("z-index", "10")
          .style("visibility", "hidden")
          .text("a simple tooltip");

  function position(dot) {
    dot .attr("cx", function(d) { return xScale(x(d)); })
        .attr("cy", function(d) { return yScale(y(d)); })
        .attr("r", function(d) { return radiusScale(radius(d)); })
        .attr("id", function(d) { return d.name;})
        .on("mouseover", function(){return tooltip.style("visibility", "visible").text(dot.attr("id"));})
        .on("mousemove", function(){return tooltip.style("top", (event.pageY-10)+"px").style("left",(event.pageX+10)+"px");})
        .on("mouseout", function(){return tooltip.style("visibility", "hidden");})
         .style("visibility", function(d) {
        var status;
        if (radius(d) > 25)
          {status = 'visible';}
        else
          {status ='hidden';}
        return status;
      });
  }


  // Defines a sort order so that the smallest dots are drawn on top.
  function order(a, b) {
    return radius(b) - radius(a);
  }

  // After the transition finishes, you can mouseover to change the year.
  function enableInteraction() {
    var yearScale = d3.scale.linear()
        .domain([1950, 2011])
        .range([box.x + 10, box.x + box.width - 10])
        .clamp(true);

    // Cancel the current transition, if any.
    svg.transition().duration(0);
	
    overlay
        .on("mouseover", mouseover)
        .on("mouseout", mouseout)
        .on("mousemove", mousemove)
        .on("touchmove", mousemove);

    function mouseover() {
      label.classed("active", true);
    }

    function mouseout() {
      label.classed("active", false);
    }

    function mousemove() {
      displayYear(yearScale.invert(d3.mouse(this)[0]));
	  alert("here");
    }
  }

  // Tweens the entire chart by first tweening the year, and then the data.
  // For the interpolated data, the dots and label are redrawn.
  function tweenYear() {
    var year = d3.interpolateNumber(1950, 2011);
    return function(t) { displayYear(year(t)); };
  }

  // Updates the display to show the specified year.
  function displayYear(year) {
    dot.data(interpolateData(year), key).call(position).sort(order);
    label.text(Math.round(year));
  }

  // Interpolates the dataset for the given (fractional) year.
  function interpolateData(year) {
    return nations.map(function(d) {
      return {
        name: d.name,
        region: d.region,
        x: interpolateValues(d.x, year),
        population: interpolateValues(d.population, year),
        y: interpolateValues(d.y, year)
      };
    });
  }

  // Finds (and possibly interpolates) the value for the specified year.
  function interpolateValues(values, year) {
    var i = bisect.left(values, year, 0, values.length - 1),
        a = values[i];
    if (i > 0) {
      var b = values[i - 1],
          t = (year - a[0]) / (b[0] - a[0]);
      return a[1] * (1 - t) + b[1] * t;
    }
    return a[1];
  }
});
