var events = [];
$(document).ready(function() {
	$.getJSON('../events.json', function(json) {
		events = json;
	})
});

// Various accessors that specify the four dimensions of data to visualize.
function x(d) { return d.x; }
function y(d) { return d.y; }
function radius(d) { return d.population; }
function color(d) { return d.region; }
function key(d) { return d.name; }

var glyear = 1950;
// Chart dimensions.
var margin = {top: 19.5, right: 19.5, bottom: 19.5, left: 39.5},
    width = 750 - margin.right,
    height = 400 - margin.top - margin.bottom;

// Various scales. These domains make assumptions of data, naturally.
var xScale = d3.scale.linear().domain([1965, 2000]).range([0, width]),
    yScale = d3.scale.log().domain([1e1, 120000]).range([height, 0]),
    radiusScale = d3.scale.sqrt().domain([1, 100000]).range([1, 70]),
    colorScale = d3.scale.category10();

// The x & y axes.
var xAxis = d3.svg.axis().orient("bottom").scale(xScale).ticks(12, d3.format(",d")),
    //yAxis = d3.svg.axis().scale(yScale).orient("left");
	yAxis = d3.svg.axis().scale(yScale).orient("left").tickFormat(function (d) {
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

/*var label = svg.append("text")
    .attr("class", "year label")
    .attr("text-anchor", "end")
    .attr("y", height - 24)
    .attr("x", width)
    .text(1800);*/

// Load the data from the json file.
d3.json("../pop.json", function(nations) {

  // A bisector since many nation's data is sparsely-defined. Empty function
  var bisect = d3.bisector(function(d) { return d[0]; });

  // Add a dot per year.
  var dot = svg.append("g")
      .attr("class", "dots")
      .selectAll(".dot")
      //not exactly sure what interpolateData does
      .data(interpolateData(1))
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
 
  /*elem.onclick = bind(function() {
    alert(this) 
  }, this);*/
  /*var box = label.node().getBBox();*/

  /*var overlay = svg.append("rect")
        .attr("class", "overlay")
        .attr("x", box.x)
        .attr("y", box.y)
        .attr("width", box.width)
        .attr("height", box.height)
        /*.on("mouseover", enableInteraction);*/

  /*var next = d3.select("#year_toggle")
        .append("div")
        .attr("id","next")
        .text("next")
        .on("click", enableInteraction);
  var prev = d3.select("#year_toggle")
        .append("div")
        .attr("id","prev")
        .text("prev")
        .on("click", enableInteraction);*/

  /*d3.select('#changer')
    .on("change", changer);

  function changer(){
    rregion = this.options[this.selectedIndex].value;
    displayYear(glyear);
  }*/

  $( "#slider" ).on( "slide", function( event, ui ) {
    enableInteraction();
    glyear = ui.value;
    displayYear(glyear);
  } );
  

  $('.check_region').change(function(){
    enableInteraction();
    glyear = $( "#slider" ).slider( "value" );
    displayYear($( "#slider" ).slider( "value" ))
  });

  /*document.getElementById("next").onclick = function(){
    if (glyear >= 2011.000)
      displayYear(2011);
    else if (glyear < 1950.000)
      displayYear(1950);
    else
      displayYear(glyear + 1)

  };

  document.getElementById("prev").onclick = function(){
    if (glyear > 2011.000)
      displayYear(2011);
    else if (glyear <= 1950.000)
      displayYear(1950);
    else
      displayYear(glyear - 1)

  };
  */

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
        .attr("cy", function(d) { if (y(d) < 1)
                                    return yScale(1);
                                  else
                                    return yScale(y(d)); })
        .attr("r", function(d) { if (radius(d) < 1)
                                    return radiusScale(1);
                                else
                                    return radiusScale(radius(d)); })
        .attr("id", function(d) { return d.name;})
        .on("mouseover", function(d){return tooltip.style("visibility", "visible").text(d.name + " " + Math.round(y(d)));})
        .on("mousemove", function(){return tooltip.style("top", (event.pageY-10)+"px").style("left",(event.pageX+10)+"px");})
        .on("mouseout", function(){return tooltip.style("visibility", "hidden");})
         .style("visibility", function(d) {
        var status;
        if (glyear > x(d))
          {status = 'visible';}
        else
          {status ='hidden';}

        if (status == 'visible')
          {
           var temp = d.region.toLowerCase().split(" ");
           if (temp.length > 1)
           {
            id_check = '#check_'+temp[0];
           }
           else
           {id_check = '#check_'+d.region.toLowerCase();}
           status = 'hidden'
           if ($(id_check).is(':checked')){
              status = 'visible'
           }
            /*if (rregion.toLowerCase() != 'all')
            {
              if (d.region.toLowerCase() != rregion.toLowerCase())
                status = 'hidden'
            }*/
            
          }
          if (status == 'visible')
          {
            if (y(d) <= 10)
              status = 'hidden'
          }
        return status;
      });
  }


  // Defines a sort order so that the smallest dots are drawn on top.
  function order(a, b) {
    return radius(b) - radius(a);
  }

  // After the transition finishes, you can mouseover to change the year.
  function enableInteraction() {
    /*var yearScale = d3.scale.linear()
        .domain([1950, 2011])
        .range([box.x + 10, box.x + box.width - 10])
        .clamp(true);*/

    // Cancel the current transition, if any.
    svg.transition().duration(0);

   /* overlay
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
    }*/

    /*next.on("click",nextyear);
    function nextyear(){
      console.log(glyear);
    }*/
  }

  // Tweens the entire chart by first tweening the year, and then the data.
  // For the interpolated data, the dots and label are redrawn.
  function tweenYear() {
    var year = d3.interpolateRound(1950, 2011);
    var glyear = year;
    return function(t) { displayYear(year(t)); };
  }

function showevent(glyear) {
		year = glyear;
		$("#eventdiv").html('')
		for (i=0; i<events.length; i++){
			if (events[i]['Year'] == year.toString()){
				eventssummary = events[i];
				if (null != eventssummary['Summary'])
					$("#eventdiv").append(eventssummary['Summary']);
				if (null != eventssummary['Jan']){					
					$("#eventdiv").append('<br><br>' + eventssummary['Jan']);					
				}
				if (null != eventssummary['Feb']){				
					$("#eventdiv").append('<br><br>' + eventssummary['Feb']);
				}
				if (null != eventssummary['Mar']){			
					$("#eventdiv").append('<br><br>' + eventssummary['Mar']);					
				}
				if (null != eventssummary['Apr']){	
					$("#eventdiv").append('<br><br>' + eventssummary['Apr']);
				}
				if (null != eventssummary['May']){	
					$("#eventdiv").append('<br><br>' + eventssummary['May']);
				}
				if (null != eventssummary['Jun']){	
					$("#eventdiv").append('<br><br>' + eventssummary['Jun']);
				}
				if (null != eventssummary['Jul']){
					$("#eventdiv").append('<br><br>' + eventssummary['Jul']);
				}
				if (null != eventssummary['Aug']){
					$("#eventdiv").append('<br><br>' + eventssummary['Aug']);
				}
				if (null != eventssummary['Sep']){
					$("#eventdiv").append('<br><br>' + eventssummary['Sep']);
				}
				if (null != eventssummary['Oct']){	
					$("#eventdiv").append('<br><br>' + eventssummary['Oct']);
				}
				if (null != eventssummary['Nov']){
					$("#eventdiv").append('<br><br>' + eventssummary['Nov']);
				}
				if (null != eventssummary['Dec']){	
					$("#eventdiv").append('<br><br>' + eventssummary['Dec']);
				}
				break;
			}
		}
	}

  // Updates the display to show the specified year.
  function displayYear(year) {
    /*console.log(year);*/
    glyear = Math.round(year);
    dot.data(interpolateData(year), key).call(position).sort(order);
    /*label.text(Math.round(year));*/
    $( "#slider" ).slider( "value", glyear )
    $('#main_year').empty().append(glyear)
	//display events code start
	showevent(glyear)
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