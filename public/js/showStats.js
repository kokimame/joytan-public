// set the dimensions and margins of the graph
var margin = {top: 10, right: 30, bottom: 30, left: 60},
    width = 460 - margin.left - margin.right,
    height = 200 - margin.top - margin.bottom;

// append the svg object to the body of the page
var lineChart = d3.select("div#line-views")
  .append("svg")
    .attr("preserveAspectRatio", "xMinYMin meet")
    .attr("viewBox", "0 0 500 500")
    .classed("svg-content", true)
  .append("g")
  .attr("transform",
        "translate(" + margin.left + "," + margin.top + ")");


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

// =============================

// var format = d3.format(",");

// // Set tooltips
// var tip = d3.tip()
//             .attr('class', 'd3-tip')
//             .offset([-10, 0])
//             .html(function(d) {
//               return "<strong>Country: </strong><span class='details'>" + d.properties.name + "<br></span>" + "<strong>Population: </strong><span class='details'>" + format(d.population) +"</span>";
//             })

// var margin = {top: 0, right: 0, bottom: 0, left: 0},
//             width = 960 - margin.left - margin.right,
//             height = 500 - margin.top - margin.bottom;

// var color = d3.scaleThreshold()
//     .domain([10000,100000,500000,1000000,5000000,10000000,50000000,100000000,500000000,1500000000])
//     .range(["rgb(247,251,255)", "rgb(222,235,247)", "rgb(198,219,239)", "rgb(158,202,225)", "rgb(107,174,214)", "rgb(66,146,198)","rgb(33,113,181)","rgb(8,81,156)","rgb(8,48,107)","rgb(3,19,43)"]);

// var path = d3.geoPath();

// var geoMap = d3.select("div#geo-map")
//             .append("svg")
//             .attr("width", width)
//             .attr("height", height)
//             .append('g')
//             .attr('class', 'map');

// var projection = d3.geoMercator()
//                   .scale(130)
//                   .translate([width / 2, height / 1.5]);

// var path = d3.geoPath().projection(projection);

// geoMap.call(tip);

// queue()
//     .defer(d3.json, "/data/world_countries.json")
//     .defer(d3.csv, "/data/watch_time_geo.csv")
//     .await(ready);

// function ready(error, data, population) {
//   var populationById = {};

//   population.forEach(d => { 
//     populationById[d.name] = +d.population; });

//   data.features.forEach(d => { 
//     d.population = populationById[d.properties.name] 
//   });

//   geoMap.append("g")
//       .attr("class", "countries")
//     .selectAll("path")
//       .data(data.features)
//     .enter().append("path")
//       .attr("d", path)
//       .style("fill", d => { return color(populationById[d.properties.name]); })
//       .style('stroke', 'white')
//       .style('stroke-width', 1.5)
//       .style("opacity",0.8)
//       // tooltips
//         .style("stroke","white")
//         .style('stroke-width', 0.3)
//         .on('mouseover', d => {
//           tip.show(d);

//           d3.select(this)
//             .style("opacity", 1)
//             .style("stroke","white")
//             .style("stroke-width",3);
//         })
//         .on('mouseout', d => {
//           tip.hide(d);
//           d3.select(this)
//             .style("opacity", 0.8)
//             .style("stroke","white")
//             .style("stroke-width",0.3);
//         })
//   geoMap.append("path")
//       .datum(topojson.mesh(data.features, (a, b) => {
//         return a.properties.name !== b.properties.name; 
//       }))
//       .attr("class", "names")
//       .attr("d", path);
// }
