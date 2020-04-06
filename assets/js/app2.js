d3.csv("./assets/data/static/data.csv").then(function(data, err) {
  if (err) throw err;
// CSV section
  var body = d3.select('#scatter')
  var selectData = [ { "text" : "obesity" },
                     { "text" : "smokes" },
                     { "text" : "healthcare"},
                     { "text" : "poverty"},
                     { "text" : "age"},
                     { "text" : "income"}
                   ]
  // Select X-axis Variable
  var span = body.append('span')
    .text('Select X-Axis variable: ')
  var yInput = body.append('select')
      .attr('id','xSelect')
      .on('change',xChange)
    .selectAll('option')
      .data(selectData)
      .enter()
    .append('option')
      .attr('value', function (d) { return d.text })
      .text(function (d) { return d.text ;})
  body.append('br')

  // Select Y-axis Variable
  var span = body.append('span')
      .text('Select Y-Axis variable: ')
  var yInput = body.append('select')
      .attr('id','ySelect')
      .on('change',yChange)
    .selectAll('option')
      .data(selectData)
      .enter()
    .append('option')
      .attr('value', function (d) { return d.text })
      .text(function (d) { return d.text ;})
  body.append('br')

  // Variables

  var svgWidth = 960;
  var svgHeight = 500;

  var scatter = d3.select('#scatter')
  var margin = { top: 60, right: 60, bottom: 60, left: 60 }
  var h = svgHeight - margin.top - margin.bottom;
  var w = svgWidth - margin.left - margin.right;
  // var formatPercent = d3.format('.2%');
  // Scales
  // var colorScale = d3.scale.category20()
  var xScale = d3.scaleLinear()
    .domain([
      d3.min([0,d3.min(data,function (d) { return d['age'] })]),
      d3.max([0,d3.max(data,function (d) { return d['age'] })])
      ])
    .range([0,w])
  var yScale = d3.scaleLinear()
    .domain([
      d3.min([0,d3.min(data,function (d) { return d['obesity'] })]),
      d3.max([0,d3.max(data,function (d) { return d['obesity'] })])
      ])
    .range([h,0])
  // SVG
  var svg = scatter.append('svg')
      .attr('height',svgHeight)
      .attr('width',svgWidth)
    .append('g')
      .attr("transform", `translate(${margin.left}, ${margin.top})`);
  // X-axis
  var xAxis = d3.axisBottom(xScale)
    .tickFormat(formatPercent)
    .ticks(5)
  // Y-axis
  var yAxis = d3.axisLeft(yScale)
    .tickFormat(formatPercent)
    .ticks(5)
  // Circles
  var circles = svg.selectAll('circle')
      .data(data)
      .enter()
    .append('circle')
      .attr('cx',function (d) { return xScale(d['age']) })
      .attr('cy',function (d) { return yScale(d['age']) })
      .attr('r','10')
      .attr('stroke','blue')
      .attr('stroke-width',1)
      // .attr('fill',function (d,i) { return colorScale(i) })
      .on('mouseover', function () {
        d3.select(this)
          .transition()
          .duration(100)
          .attr('r',20)
          .attr('stroke-width',3)
      })
      .on('mouseout', function () {
        d3.select(this)
          .transition()
          .duration(100)
          .attr('r',10)
          .attr('stroke-width',1)
      })
    // .append('title') // Tooltip
    //   .text(function (d) { return d.variable +
    //                        '\nReturn: ' + formatPercent(d['Obese']) +
    //                        '\nStd. Dev.: ' + formatPercent(d['Smokes']) +
    //                        '\nMax Drawdown: ' + formatPercent(d['Lacks Healthcare']) })

    // X-axis
  svg.append('g')
      .attr('class','axis')
      .attr('id','xAxis')
      .attr('transform', 'translate(0,' + h + ')')
      .call(xAxis)
    .append('text') // X-axis Label
      .attr('id','xAxisLabel')
      // .attr('y',-10)
      // .attr('x',w)
      // .attr('dy','.71em')
      .style('text-anchor','end')
      .text('Age')


  // Y-axis
  svg.append('g')
      .attr('class','axis')
      .attr('id','yAxis')
      .call(yAxis)
    .append('text') // y-axis Label
      .attr('id', 'yAxisLabel')
      .attr('transform','rotate(-90)')
      .attr('x',0)
      .attr('y',5)
      .attr('dy','.71em')
      .style('text-anchor','end')
      .text('Obese')

  function yChange() {
    var value = this.value // get the new y value
    yScale // change the yScale
      .domain([
        d3.min([0,d3.min(data,function (d) { return d[value] })]),
        d3.max([0,d3.max(data,function (d) { return d[value] })])
        ])
    yAxis.scale(yScale) // change the yScale
    d3.select('#yAxis') // redraw the yAxis
      .transition().duration(100)
      .call(yAxis)
    d3.select('#yAxisLabel') // change the yAxisLabel
      .text(value)    
    d3.selectAll('circle') // move the circles
      .transition().duration(100)
      .delay(function (d,i) { return i*100})
        .attr('cy',function (d) { return yScale(d[value]) })
  }

  function xChange() {
    var value = this.value // get the new x value
    xScale // change the xScale
      .domain([
        d3.min([0,d3.min(data,function (d) { return d[value] })]),
        d3.max([0,d3.max(data,function (d) { return d[value] })])
        ])
    xAxis.scale(xScale) // change the xScale
    d3.select('#xAxis') // redraw the xAxis
      .transition().duration(100)
      .call(xAxis)
    d3.select('#xAxisLabel') // change the xAxisLabel
      .transition().duration(100)
      .text(value)
    d3.selectAll('circle') // move the circles
      .transition().duration(100)
      .delay(function (d,i) { return i*100})
        .attr('cx',function (d) { return xScale(d[value]) })
  }
})