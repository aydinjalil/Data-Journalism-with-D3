// @TODO: YOUR CODE HERE!
// Define SVG area dimensions
var svgWidth = 960;
var svgHeight = 500;

// Define the chart's margins as an object
var margin = {
  top: 20,
  right: 40,
  bottom: 80,
  left: 100
};


// Define dimensions of the chart area
var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

var aspect = width/height,
   scatter_selector = d3.select('#scatter');



// var scatter_selector = d3.select("#scatter");

var svg = scatter_selector.append("svg")
                  .attr("width", svgWidth)
                  .attr("height", svgHeight)
                  .call(responsivefy);


var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left+40}, ${margin.top})`);

var chosenXAxis = "poverty";
var chosenYAxis = "healthcare";

function xScale(data, chosenXAxis) {
  // create scales
  var xLinearScale = d3.scaleLinear()
    .domain([d3.min(data, d => d[chosenXAxis]) * 0.8,
      d3.max(data, d => d[chosenXAxis]) * 1.2
    ])
    .range([0, width]); 

  return xLinearScale;

}

// ** function for Yscale
function yScale(data, chosenYAxis) {
  // create scales
  var yLinearScale = d3.scaleLinear()
    .domain([d3.min(data, d => d[chosenYAxis]) * 0.8,
      d3.max(data, d => d[chosenYAxis]) * 1.2
    ])
    .range([height, 0]); 

  return yLinearScale;

}

// function used for updating xAxis var upon click on X axis label
function renderXAxes(newXScale, xAxis) {
  var bottomAxis = d3.axisBottom(newXScale);
  
    xAxis.transition()
    .duration(500)
    .call(bottomAxis);

    return xAxis;  

}

// function used for updating yAxis var upon click on Y axis label
function renderYAxes(newYScale, yAxis) {
  var leftAxis = d3.axisLeft(newYScale);
  
    yAxis.transition()
    .duration(500)
    .call(leftAxis);

    return yAxis;  

}



// function used for updating circles group based on X axis changewith a transition to
// new circles
function renderXCircles(circlesGroup, newXScale, chosenXAxis) {

  circlesGroup.transition()
    .duration(500)
    .attr("cx", d => newXScale(d[chosenXAxis]));

  return circlesGroup;
}

// function used for updating circles group based on Y axis changewith a transition to
// new circles 
function renderYCircles(circlesGroup, newYScale, chosenYAxis) {

  circlesGroup.transition()
    .duration(500)
    .attr("cy", d => newYScale(d[chosenYAxis]));

  return circlesGroup;
}

// Function renders the inner text that is shown in each circle when X axis is changing. 
function renderXInnerText(innerTextGroup, newXScale, newXAxis){
 // d3.select(".inner_text").selectAll("text").remove()
  innerTextGroup.transition()
    .duration(500)
    .attr("x", d => newXScale(d[newXAxis]))

    }

// Function renders the inner text that is shown in each circle when Y axis is changing. 
function renderYInnerText(innerTextGroup, newYScale, newYAxis){
 // d3.select(".inner_text").selectAll("text").remove()
     innerTextGroup.transition()
    .duration(500)
    .attr("y", d => newYScale(d[newYAxis]))

    }


// This function updates the popup information on mouseOver event depending on the chosen x and y labels
function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup) {

  var label_x;
  var label_y;

  if (chosenXAxis === "poverty") {
    label_x = "Poverty(%): ";
  }
  else if (chosenXAxis === "age") {
    label_x = "Age (Median):";
  }
  else{
    label_x = "Household Income (Median) in USD:"
  }

  if (chosenYAxis === "healthcare") {
    label_y = "Lack of HC %: ";
  }
  else if (chosenYAxis === "smokes") {
    label_y = "Smokes(%):";
  }
  else{
    label_y = "Obesity(%):"
  }

  var toolTip = d3.tip()
    .attr("class", "tooltip")
    .offset([80, -60])
    .html(function(d) {
      return (`${d.state}<br>${label_x} ${d[chosenXAxis]}<br>${label_y} ${d[chosenYAxis]}`);
    });

  chartGroup.call(toolTip);

  circlesGroup.on("mouseover", function(data) {
    toolTip.show(data, this);
  })
    // onmouseout event
    .on("mouseout", function(data, index) {
      toolTip.hide(data);
    });

  return circlesGroup;
}


// Read csv file

d3.csv("./assets/data/static/data.csv").then(function(complete_data, err) {
  if (err) throw err;

  // parse data into Int
  complete_data.forEach(function(data) {
    data.age = +data.age;
    data.smokes = +data.smokes;
    data.poverty = + data.poverty;
    data.healthcare = + data.healthcare;
    data.income = + data.income;
    data.obesity = + data.obesity;
  });

  var xLinearScale = xScale(complete_data, chosenXAxis);
  var yLinearScale = yScale(complete_data, chosenYAxis);

  // Create initial axis functions
  var bottomAxis = d3.axisBottom(xLinearScale);
  var leftAxis = d3.axisLeft(yLinearScale);

  // append x axis
  var xAxis = chartGroup.append("g")
    .classed("x-axis", true)
    .attr("transform", `translate(0, ${height})`)
    .call(bottomAxis);

  var yAxis = chartGroup.append("g")
    .classed("y-axis", true)
    // .attr("transform", `translate(${height}, ${width})`)
    .call(leftAxis);

 
 // circlesGroupd is the new variable that will help us further when we want to change the positions
 // of each circle depending on the X or Y axis label click. Will will be transitioning the
 // whole group of circles.
  var circlesGroup = chartGroup.selectAll("circle")
    .data(complete_data)
    .enter()
    .append("circle")
    .attr("cx", d => xLinearScale(d[chosenXAxis]))
    .attr("cy", d => yLinearScale(d[chosenYAxis]))
    .attr("r", 14)
    .attr("fill", "blue")
    .attr("opacity", ".5");

  // innerTextGroup is the new variable that will help us further when we want to change the positions
  // of each text inside the circle depending on the X or Y axis label click. Will will be transitioning the
  // whole group of texts.
    var innerTextGroup = chartGroup.selectAll()
      .classed("inner_text", true)
      .data(complete_data)
      .enter()
      .append("text")
      .attr("x", d => xLinearScale(d[chosenXAxis]))
      .attr("y", d => yLinearScale(d[chosenYAxis]))
      .text(d=>d.abbr)
      .style("font-size", "10px")
      .style("text-anchor", "middle")
      .attr("fill", "white");



  // Create group for  3 x- axis labels
  var xLabelsGroup = chartGroup.append("g")
    .attr("transform", `translate(${width / 2}, ${height + 20})`);

  var povertyLabel = xLabelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 20)
    .attr("value", "poverty") // value to grab for event listener
    .classed("active", true)
    .text("In Poverty (%)");

  var ageLabel = xLabelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 40)
    .attr("value", "age") // value to grab for event listener
    .classed("inactive", true)
    .text("Age (Median)");

  var incomeLabel = xLabelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 60)
    .attr("value", "income") // value to grab for event listener
    .classed("inactive", true)
    .text("Household Income (Median)");

  // Create group for  3 y- axis labels
var yLabelsGroup = chartGroup.append("g")
    .attr("transform", `translate(${0-margin.left}, ${height/2})`);

  // append y axis  
  var healthLabel = yLabelsGroup.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 0)
    .attr("x", 0)
    .attr("value", "healthcare")
    .attr("dy", "1em")
    .classed("active", true)
    // .style("text-anchor", "middle")
    .text("Lacks Healthcare(%)");

  var smokeLabel = yLabelsGroup.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 20)
    .attr("x", 0)
    .attr("value", "smokes")
    .attr("dy", "1em")
    .classed("inactive", true)
    .text("Smokes(%)");

  var obeseLabel = yLabelsGroup.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 40)
    .attr("x", 0)
    .attr("value", "obesity")
    .attr("dy", "1em")
    .classed("inactive", true)
    .text("Obese(%)");



  // updateToolTip function above csv import
  var circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

  // x axis labels event listener
  xLabelsGroup.selectAll("text")
    .on("click", function() {
      // get value of selection
      var value = d3.select(this).attr("value");
      if (value !== chosenXAxis) {

        // replaces chosenXAxis with value
        chosenXAxis = value;


        // functions here found above csv import
        // updates x scale for new data
        xLinearScale = xScale(complete_data, chosenXAxis);

        // updates x axis with transition
        xAxis = renderXAxes(xLinearScale, xAxis);

        // updates circles with new x values
        circlesGroup = renderXCircles(circlesGroup, xLinearScale, chosenXAxis);
        // change the location of the inner text to the new location of the circle
        renderXInnerText(innerTextGroup, xLinearScale, chosenXAxis);

        // updates tooltips with new info
        circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

        // changes classes to change bold text
        if (chosenXAxis === "poverty") {
          povertyLabel
            .classed("active", true)
            .classed("inactive", false);
          ageLabel
            .classed("active", false)
            .classed("inactive", true);
          incomeLabel
            .classed("active", false)
            .classed("inactive", true);
        }

        if (chosenXAxis === "age") {
          ageLabel
            .classed("active", true)
            .classed("inactive", false);
          povertyLabel
            .classed("active", false)
            .classed("inactive", true);
          incomeLabel
            .classed("active", false)
            .classed("inactive", true);
        }

        if (chosenXAxis === "income") {
          incomeLabel
            .classed("active", true)
            .classed("inactive", false);
          povertyLabel
            .classed("active", false)
            .classed("inactive", true);
          ageLabel
            .classed("active", false)
            .classed("inactive", true);
        }
    
    }
  });
    yLabelsGroup.selectAll("text")
    .on("click", function() {
      // get value of selection
      var value = d3.select(this).attr("value");
      if (value !== chosenYAxis) {

        // replaces chosenXAxis with value
        chosenYAxis = value;

        // functions here found above csv import
        // updates x scale for new data
        yLinearScale = yScale(complete_data, chosenYAxis);

        // updates x axis with transition
        yAxis = renderYAxes(yLinearScale, yAxis);

        // updates circles with new y values
        circlesGroup = renderYCircles(circlesGroup, yLinearScale, chosenYAxis);
        // change the location of text based on the new position of the circle
        renderYInnerText(innerTextGroup, yLinearScale, chosenYAxis);
        
        // updates tooltips with new info
        circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

        // changes classes to change bold text
        if (chosenYAxis === "healthcare") {
          healthLabel
            .classed("active", true)
            .classed("inactive", false);
          smokeLabel
            .classed("active", false)
            .classed("inactive", true);
          obeseLabel
            .classed("active", false)
            .classed("inactive", true);
        }

        if (chosenYAxis === "smokes") {
          smokeLabel
            .classed("active", true)
            .classed("inactive", false);
          healthLabel
            .classed("active", false)
            .classed("inactive", true);
          obeseLabel
            .classed("active", false)
            .classed("inactive", true);
        }

        if (chosenYAxis === "obesity") {
          obeseLabel
            .classed("active", true)
            .classed("inactive", false);
          smokeLabel
            .classed("active", false)
            .classed("inactive", true);
          healthLabel
            .classed("active", false)
            .classed("inactive", true);
        }
      }
});

}).catch(function(error) {
  console.log(error);
});

function responsivefy(svg) {
  // container will be the DOM element
  // that the svg is appended to
  // we then measure the container
  // and find its aspect ratio
  const container = d3.select(svg.node().parentNode),
      width = parseInt(svg.style('width'), 10),
      height = parseInt(svg.style('height'), 10),
      aspect = width / height;
 
  // set viewBox attribute to the initial size
  // control scaling with preserveAspectRatio
  // resize svg on inital page load
  svg.attr('viewBox', `0 0 ${width} ${height}`)
      .attr('preserveAspectRatio', 'xMinYMid')
      .call(resize);
 
  // add a listener so the chart will be resized
  // when the window resizes
  // multiple listeners for the same event type
  // requires a namespace, i.e., 'click.foo'
  // api docs: https://goo.gl/F3ZCFr
  d3.select(window).on(
      'resize.' + container.attr('id'), 
      resize
  );
 
  // this is the code that resizes the chart
  // it will be called on load
  // and in response to window resizes
  // gets the width of the container
  // and resizes the svg to fill it
  // while maintaining a consistent aspect ratio
  function resize() {
      const w = parseInt(container.style('width'));
      svg.attr('width', w);
      svg.attr('height', Math.round(w / aspect));
  }
}
