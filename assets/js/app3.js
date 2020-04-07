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

var scatter_selector = d3.select("#scatter");

var svg = scatter_selector.append("svg")
                  .attr("width", svgWidth)
                  .attr("height", svgHeight);

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

// ** function for Yscale added new
function yScale(data, chosenYAxis) {
  // create scales
  var yLinearScale = d3.scaleLinear()
    .domain([d3.min(data, d => d[chosenYAxis]) * 0.8,
      d3.max(data, d => d[chosenYAxis]) * 1.2
    ])
    .range([height, 0]); 
  // var yLinearScale = d3.scaleLinear()
  //   .domain([0, d3.max(data, d => d[chosenYAxis])])
  //   .range([height, 0]);

  return yLinearScale;

}

// function used for updating xAxis var upon click on axis label
function renderXAxes(newXScale, xAxis) {
  var bottomAxis = d3.axisBottom(newXScale);
  
    xAxis.transition()
    .duration(1000)
    .call(bottomAxis);

    return xAxis;  

}

function renderYAxes(newYScale, yAxis) {
  var leftAxis = d3.axisLeft(newYScale);
  
    yAxis.transition()
    .duration(1000)
    .call(leftAxis);

    return yAxis;  

}



// function used for updating circles group with a transition to
// new circles
function renderXCircles(circlesGroup, newXScale, chosenXAxis) {

  circlesGroup.transition()
    .duration(1000)
    .attr("cx", d => newXScale(d[chosenXAxis]));

  return circlesGroup;
}

function renderYCircles(circlesGroup, newYScale, chosenYAxis) {

  circlesGroup.transition()
    .duration(1000)
    .attr("cy", d => newYScale(d[chosenYAxis]));

  return circlesGroup;
}

function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup) {

  var label_x;
  var label_y;

  if (chosenXAxis === "poverty") {
    label_x = "Poverty: ";
  }
  else if (chosenXAxis === "age") {
    label_x = "Age (Median):";
  }
  else{
    label_x = "Household Income (Median):"
  }

  if (chosenYAxis === "healthcare") {
    label_y = "Lack of HC: ";
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

  circlesGroup.call(toolTip);

  circlesGroup.on("mouseover", function(data) {
    toolTip.show(data);
  })
    // onmouseout event
    .on("mouseout", function(data, index) {
      toolTip.hide(data);
    });

  return circlesGroup;
}


// Read csv file
// var data = d3.csv("./assets/data/static/data.csv");



// var circle_element = svg.append("circle");

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
  // xLinearScale function above csv import
  // var xLinearScale = xScale(complete_data, chosenXAxis);
  // // var yLinearScale = yScale(complete_data, chosenYAxis);

  // // Create y scale function
  // var yLinearScale = d3.scaleLinear()
  //   .domain([0, d3.max(complete_data, d => d[chosenYAxis])])
  //   .range([height, 0]);

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

  // append y axis
  // chartGroup.append("g")
  //   .call(leftAxis);

  // append initial circles
  var circlesGroup = chartGroup.selectAll("circle")
    .data(complete_data)
    .enter()
    .append("circle")
    .attr("cx", d => xLinearScale(d[chosenXAxis]))
    .attr("cy", d => yLinearScale(d[chosenYAxis]))
    .attr("r", 12)
    .attr("fill", "blue")
    .attr("opacity", ".5");



   chartGroup.selectAll()
    .data(complete_data)
    .enter()
    .append("text")
    .attr("x", d => xLinearScale(d[chosenXAxis]))
    .attr("y", d => yLinearScale(d[chosenYAxis]))
    .style("font-size", "10px")
    .style("text-anchor", "middle")
    // .attr("r", 12)
    .attr("fill", "white")
    .text(d=>d.abbr);


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

        // console.log(chosenXAxis)

        // functions here found above csv import
        // updates x scale for new data
        xLinearScale = xScale(complete_data, chosenXAxis);

        // updates x axis with transition
        xAxis = renderXAxes(xLinearScale, xAxis);

        // updates circles with new x values
        circlesGroup = renderXCircles(circlesGroup, xLinearScale, chosenXAxis);

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

        // console.log(chosenXAxis)

        // functions here found above csv import
        // updates x scale for new data
        yLinearScale = yScale(complete_data, chosenYAxis);

        // updates x axis with transition
        yAxis = renderYAxes(yLinearScale, yAxis);

        // updates circles with new x values
        circlesGroup = renderYCircles(circlesGroup, yLinearScale, chosenYAxis);

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