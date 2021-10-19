const projectName = 'heatmap-graph';

let url = 'https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json';
let req = new XMLHttpRequest();

let baseTemps;
let values = []; //monthly variances

let xAxis,
    yAvis,
    xScale,
    yScale;

// colors cold to hot (blue to red)
let colors = ['#4169E1','#6495ED', '#87CEEB', '#E0FFFF', '#FFFACD', '#FFA500', '#FF7F50', '#DC143C', '#8B0000'];
// Temp threshold labels
let tempRef = ['2.8', '3.9', '5.0', '6.1', '7.2', '8.3', '9.5', '10.6', '11.7', '12.8'];
//Months
let monthsArr = ['January','February','March','April','May','June','July','August','September','October','November','December']


//graph layout
let margin = {
    top: 20,
    right: 25,
    bottom: 35,
    left: 85
}

let width = 950 - margin.left - margin.right;
let height = 650 - margin.top - margin.bottom;

//svg 
let svg = d3.select('svg')
            .attr('width', width + margin.left + margin.right)
            .attr('height', height + margin.top + margin.bottom)
            .append('g')
            .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');
//tooltip
let tooltip = d3.select('.container')
                .append('div')
                .attr('id', 'tooltip')
                .attr('class', 'tooltip')
                .style('visibility', 'hidden')
                .style('opacity', 0)
 
          
                
//draw graph area
let makeGraph = () => {
    svg.attr('width', width)
    svg.attr('height', height)
}

//build scale for X & Y axis
let setScales = () => {

    let minYr = d3.min(values, function(d) {
        return d['year']
    })

    let maxYr = d3.max(values, function (d) {
        return d['year']
    })

    //scale set-up
    //years
    xScale = d3.scaleLinear()
                .domain([minYr, maxYr + 1])
                .range([0, width - margin.right])
    //months
    yScale = d3.scaleTime()
                .domain([new Date(0,0,0,0,0,0,0), new Date(0,12,0,0,0,0,0)])
                .range([height - (margin.top + margin.bottom), 0])

}

let setAxis = () => {

    xAxis = d3.axisBottom(xScale)
                .tickFormat(d3.format('d'))
    
    yAxis = d3.axisLeft(yScale)
                .tickFormat(d3.timeFormat('%B'))
    
    //set up x & y axis on graph
    svg.append('g')
        .call(xAxis)
        .attr('id', 'x-axis')
        .attr('transform', 'translate(0,' +
        (height - (margin.top + margin.bottom)) + ')')
     
    
    svg.append('g')
        .call(yAxis)
        .attr('id', 'y-axis')
        .attr('transform', 'translate(' + 
        // margin.bottom
        + ', 0)')

    //x axis label
    svg.append('text')
        .attr('class', 'x-label')
        .attr('text-anchor', 'end')
        .attr('x', width - (margin.left+margin.right))
        .attr('y', height - margin.top)
        .style('font-size', '18px')
        .text('Years')
    
    //y axis label
    svg.append('text')
        .attr('class', 'y-label')
        .attr('text-anchor', 'end')
        .attr('transform', 'rotate(-90)')
        .attr('y', -margin.left+12)
        .attr('x', -margin.top)
        .style('font-size', '18px')
        .text('Months')
       
        
}

// Referenced these sites: 
// https://observablehq.com/@sjengle/zillow-affordability-heatmap &
// https://bl.ocks.org/mbostock/4573883

let setDataCells = () => {

    svg.selectAll('rect')
        .data(values)
        .enter()
        .append('rect')
        .attr('class', 'cell')
        .attr('fill', function(d) {
            
           let variance = d['variance']

            if (variance <= -4) {
                return colors[0];
            }
            else if (variance <= -3) {
                return colors[1];
            }
            else if (variance <= -2) {
                return colors[2];
            }
            else if (variance <= -1) {
                return colors[3];
            }
            else if (variance <= 0) {
                return colors[4];
            }
            else if (variance <= 1) {
                return colors[5];
            }
            else if (variance <= 2) {
                return colors[6];
            }
            else if (variance <= 3) {
                return colors[7];
            }
            else {
                return colors[8];
            }
            
        })
        .attr('data-year', function(d) {
            return d['year']
        })
        .attr('data-month', function(d) {
            return d['month'] - 1
        })
        .attr('data-temp', function(d) {
            return baseTemps + d['variance']
        })
        .attr('height', function(d) {
            return (height - (2 * (margin.top - margin.bottom + 30))) /12
        })
        .attr('y', function(d) {
            return yScale(new Date(0, d['month'] 
            //- 1, 0, 0, 0, 0, 0
            ))
        })
        .attr('width', function (d) {
            var minYr = d3.min(values, function(d) {
                return d['year']
            })
            var maxYr = d3.max(values, function(d) {
                return d['year']
            })

            var yrCount =  maxYr - minYr

            return (width - (2 * (margin.left + margin.right)))/ yrCount
        })
        .attr('x', function(d) {
            return xScale(d['year'])
        })
        .on('mouseover', function(event, d) {
            tooltip.transition()
                    .duration(300)
                    .style('visibility', 'visible')
                    .style('opacity', 1)
                    
                                    
            let monthsArr = ['January',
                             'February',
                             'March',
                             'April',
                             'May',
                             'June',
                             'July',
                             'August',
                             'September',
                             'October',
                             'November',
                             'December']
            
            tooltip.text(d['year'] +
                    ' - ' + 
                    monthsArr[d['month'] - 1] +
                    ' Temperature: ' + (baseTemps + d['variance']).toFixed(3) + '°C ' +
                    ' Variance: ' + d['variance'] + '°C ')

            tooltip.attr('data-year', d['year'])
        
        })
        .on('mouseout', function(event, d) {
            tooltip.transition()
                .duration(500)
                .style('visibility', 'hidden')
                .style('opacity', 0);
        })       
}

//LEGEND THRESHOLD
// Reference: https://bl.ocks.org/hepplerj/f2f4e5f4a9321428b11614674c741177

let size = 30;
/*
let threshold = d3.scaleThreshold()
                  .domain(tempRef)
                  .range(colors);
*/
let legendBox = d3.select('svg')
                  .append('g')
                  .attr('id', 'legend')
                  .classed('legend', true)
                  .attr(
                      'transform',
                      'translate(' + 
                        margin.left +
                        ',' +
                        (margin.top + height + margin.bottom - 2 * (size+5)) +
                        ')'
                      )
                
legendBox.selectAll('.threshold')
         .data(colors)
         .enter()
         .append('rect')
            .classed('threshold', true)
            .attr('fill', function(d) {
                    return d
            })
            .attr('width', size)
            .attr('height', size)
            .attr('x', function(d, ind) {
                    return (ind + 10) * size
            })
            .attr('y', '30px')
           
            
legendBox.selectAll('text')
         .data(tempRef)
         .enter()
            .append('text')
            .attr('x', function(d, i) {
                return (i + 9.7) *(size)
            })
            .attr('y', size+40)
            .style('font-size', '0.7rem')
            .text(function(d,i) {
                return `${tempRef[i]}`
            });


//FETCH DATA
req.open('GET', url, true)
//once data has been retrieved
req.onload = () => {
    let data = JSON.parse(req.responseText)

    values = data.monthlyVariance
    console.log(values)

    baseTemps = data.baseTemperature
    console.log(baseTemps)


    makeGraph();
    setScales();
    setDataCells();
    setAxis();
}
req.send();