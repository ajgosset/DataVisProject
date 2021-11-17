let svgSimple = d3.select('#node-graph');
let svgWidth = 398;
let svgHeight = 698;


let data;

//Get Data
Promise.all([d3.csv('../Data/ProgrammingLanguagesTaggedInPython/TagsDated.csv'),
d3.csv('../Data/MostPopularProgrammingLangs/Most Popular ProgrammingLanguagesfrom2004to2021.csv')])
.then(function(values){

let tagsData = values[0];
let popularData = values[1];
let programmingLangs = Object.keys(popularData[0]).slice(1);

let dataNodes = [];
let dataLinks = [];

//Data wrangling
programmingLangs.forEach((lang, index) => {
    if(lang != 'Python'){
    dataLinks.push({'source': lang,
        'target': 'Python'});
    }
    dataNodes.push({'name': lang, 'id': index})
});

data = {
    'nodes': dataNodes,
    'links': dataLinks
}
drawNodeGraph();
})

function drawNodeGraph(){

    let nodes = data.nodes;
    let links = data.links;

// Here's the d3.simulation.
let simulation1 = d3.forceSimulation()
                    .nodes(nodes);

simulation1.force('charge',d3.forceManyBody()) 
            .force('collide', d3.forceCollide())
            .force('center', d3.forceCenter( svgWidth/2, svgHeight/2 ));

// Now add the nodes to svg as circles
let simpleNodes = svgSimple.selectAll('.node')
                          .data(nodes)
                          .join('circle')
                          .classed('node',true)
                          .style('fill', d => d.sex == 'F' ? 'khaki' : 'paleturquoise' )
                          .attr('r', 20);
let simpleLabels = svgSimple.selectAll('.node-label')
                          .data(nodes)
                          .join('text')
                          .classed('node-label', true)
                          .text(d => d.name)

function updateLayout1() {
    simpleNodes.attr('cx', d => d.x)
                .attr('cy', d => d.y);
    simpleLabels.attr('x', d => d.x)
                .attr('y', d => d.y);
}

simulation1.on('tick', updateLayout1)
          .on('end', () => { console.log(nodes); });

let linkForce1 = d3.forceLink(links)
                    .id(d => d.name);


simulation1.force('links', linkForce1)
            .on('tick', updateLayout2);

let simpleLinks = svgSimple.selectAll('.link')
                            .data(links)
                            .join('line')
                            .classed('link',true);

// And an updated layout function
function updateLayout2() {
    simpleNodes.attr('cx', d => d.x)
                .attr('cy', d => d.y);
    simpleLabels.attr('x', d => d.x)
                .attr('y', d => d.y);
    simpleLinks.attr('x1', d => d.source.x)
                .attr('y1', d => d.source.y)
                .attr('x2', d => d.target.x)
                .attr('y2', d => d.target.y);
}

linkForce1.distance(50)   // default distance is 30
        .strength(.33)   // default strength is 1
simulation1.force('charge', d3.forceManyBody().strength(-400));
}