let tagsData = [];
let popularData = [];
let programmingLangs = [];
let dateMap = {};
let dateList = []

let date;

//Margins
const margin = {top: 10, right: 30, bottom: 30, left: 40},
  width = 500 - margin.left - margin.right,
  height = 500 - margin.top - margin.bottom;

const svg = d3.select("#Node_Graph")
  .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform",
          `translate(${margin.left}, ${margin.top})`);



//Get Data
Promise.all([d3.csv('../Data/ProgrammingLanguagesTaggedInPython/TagsDated.csv'),
  d3.csv('../Data/MostPopularProgrammingLangs/Most Popular ProgrammingLanguagesfrom2004to2021.csv')])
  .then(function(values){

  tagsData = values[0];
  popularData = values[1];
  programmingLangs = Object.keys(popularData[0]).slice(1);

  //build dateMap indexes
    popularData.forEach(function(item, index){
      dateMap[item.Date] = index
      dateList.push(item.Date)
    })

    console.log(popularData)
    console.log(dateMap)

    drawSlider()
    drawPieChart(0)
  //drawNodeGraph();
})

function drawNodeGraph(){
  // Initialize the links
  const link = svg
    .selectAll("line")
    .data(data.links)
    .join("line")
      .style("stroke", "#aaa")

  // Initialize the nodes
  const node = svg
    .selectAll("circle")
    .data(data.nodes)
    .join("circle")
      .attr("r", 20)
      .style("fill", "#69b3a2")

  // Let's list the force we wanna apply on the network
  const simulation = d3.forceSimulation(data.nodes)                 // Force algorithm is applied to data.nodes
      .force("link", d3.forceLink()                               // This force provides links between nodes
            .id(function(d) { return d.id; })                     // This provide  the id of a node
            .links(data.links)                                    // and this the list of links
      )
      .force("charge", d3.forceManyBody().strength(-400))         // This adds repulsion between nodes. Play with the -400 for the repulsion strength
      .force("center", d3.forceCenter(width / 2, height / 2))     // This force attracts nodes to the center of the svg area
      .on("end", ticked);

  // This function is run at each iteration of the force algorithm, updating the nodes position.
  function ticked() {
    link
        .attr("x1", function(d) { return d.source.x; })
        .attr("y1", function(d) { return d.source.y; })
        .attr("x2", function(d) { return d.target.x; })
        .attr("y2", function(d) { return d.target.y; });

    node
         .attr("cx", function (d) { return d.x+6; })
         .attr("cy", function(d) { return d.y-6; });
  }

}

function drawSlider(){
  let formatDateIntoYear = d3.timeFormat("%Y");
  let formatDate = d3.timeFormat("%B %Y");
  let startDate = new Date("2004-07-01")
  let endDate = new Date("2021-09-01")

  let slider_svg = d3.select("#slider_svg")

  let x = d3.scaleTime()
    .domain([startDate, endDate])
    .range([0, 900])
    .clamp(true);

  let slider = slider_svg.append("g")
      .attr("class", "slider")
      .attr("transform", "translate(" + margin.left + "," + 50 + ")");

  slider.append("line")
      .attr("class", "track")
      .attr("x1", x.range()[0])
      .attr("x2", x.range()[1])
      .select(function() { return this.parentNode.appendChild(this.cloneNode(true)); })
      .attr("class", "track-inset")
      .select(function() { return this.parentNode.appendChild(this.cloneNode(true)); })
      .attr("class", "track-overlay")
      .call(d3.drag()
          .on("start.interrupt", function() { slider.interrupt(); })
          .on("start drag", function() {
            currentValue = d3.event.x;
            update(x.invert(currentValue));
          })
      );

  slider.insert("g", ".track-overlay")
      .attr("class", "ticks")
      .attr("transform", "translate(0," + 18 + ")")
      .selectAll("text")
      .data(x.ticks(10))
      .enter()
      .append("text")
      .attr("x", x)
      .attr("y", 10)
      .attr("text-anchor", "middle")
      .text(function(d) { return formatDateIntoYear(d); });

  let label = slider.append("text")
      .attr("class", "label")
      .attr("text-anchor", "middle")
      .text(formatDate(startDate))
      .attr("transform", "translate(0," + (-25) + ")")

  let handle = slider.insert("circle", ".track-overlay")
      .attr("class", "handle")
      .attr("r", 9);

  console.log(dateMap)
    function update(h) {
      console.log(dateMap[formatDate(h)])
      drawPieChart(dateMap[formatDate(h)])

      // update position and text of label according to slider scale
      handle.attr("cx", x(h));
      label
          .attr("x", x(h))
          .text(formatDate(h));
    }
}




function drawPieChart(dateIndex){

  let svg = d3.select("#pie_chart_svg"),
      width = svg.attr("width"),
      height = svg.attr("height")

  svg.selectAll("*").remove();


  let radius = 200
  let monthData = parseMonth(popularData[dateIndex])


  let g = svg.append("g")
      .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

  // Step 4
  let ordScale = d3.scaleOrdinal()
      .domain(monthData)
      .range(d3.schemeSet3);

  // Step 5
  let pie = d3.pie().value(function(d) {
    return d.value;
  });

  let arc = g.selectAll("arc")
      .data(pie(monthData))
      .enter();

  // Step 6
  let path = d3.arc()
      .outerRadius(radius)
      .innerRadius(0);

  arc.append("path")
      .attr("d", path)
      .attr("fill", function(d) { return ordScale(d.data.name); });

  // Step 7
  let label = d3.arc()
      .outerRadius(radius)
      .innerRadius(0);

  arc.append("text")
      .attr("transform", function(d) {
        return "translate(" + label.centroid(d) + ")";
      })
      .text(function(d) { return d.data.name; })
      .style("font-family", "arial")
      .style("font-size", 15);
}

function parseMonth(data){
  let parsed = []

  for (const language in data){
    if (language != "Date"){
      parsed.push({
        name: language,
        value: parseFloat(data[language])
      })
    }
  }

  return parsed

}