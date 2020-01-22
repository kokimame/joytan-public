// set the dimensions and margins of the graph
var margin = {top: 30, right: 30, bottom: 50, left: 50},
    width = 450 - margin.left - margin.right,
    height = 200 - margin.top - margin.bottom;

// append the svg object to the body of the page
var lineChart = d3.select("div#youtube-views")
  .append("svg")
    .attr("preserveAspectRatio", "xMinYMin meet")
    .attr("viewBox", "0 0 500 250")
    .classed("svg-content", true)
  .append("g")
  .attr("transform",
        "translate(" + margin.left + "," + margin.top + ")")

//Create Title 
lineChart.append("text")
  .attr("x", (width / 2))             
  .attr("y", (margin.top / 2))
  .attr("text-anchor", "middle")  
  .style("font-size", "16px") 
  .text("Daily YouTube Views");

//Read the data
d3.csv("/data/quick_report.csv",
  // When reading the csv, I must format variables:
  d => {
    return { day : d3.timeParse("%Y-%m-%d")(d.day),
            watchTime : d.estimatedMinutesWatched,
            views : d.views,
            likes : d.likes, 
            subGain : d.subscribersGained }
  },

  // Now I can use this dataset:
  data => {
    // Add X axis --> it is a date format
    var x = d3.scaleTime()
      .domain(d3.extent(data, d => { return d.day; }))
      .range([ 0, width ]);
    lineChart.append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x));

    // Add Y axis
    var y = d3.scaleLinear()
      .domain([0, d3.max(data, d => { return +d.views; })])
      .range([ height, 0 ]);
    lineChart.append("g")
      .call(d3.axisLeft(y));

    // Add the line
    lineChart.append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", "tomato")
      .attr("stroke-width", 1.5)
      .attr("d", d3.line()
        .x(d => { return x(d.day) })
        .y(d => { return y(d.views) })
        )
})