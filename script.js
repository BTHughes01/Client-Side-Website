'use strict';

/** the intro element from the html */
const intro = document.getElementById('intro');

/** the function that is called when the into is moused over, makes the intro element become transparent */
function introMouseOver () {
    intro.style = 'transition: 0.3s;opacity:0.8;';
}

/** the function that is called when the into is moused over, makes the intro element become opaque */
function introMouseOut () {
    intro.style.opacity = 1;
}

intro.addEventListener('mouseover', introMouseOver);
intro.addEventListener('mouseout', introMouseOut);

// code for the first bar chart

// some of my code to work out how wide the svg element should be
/** a class that stores the dimensions of the margin for svg elements */
class WindowMargin {
  /**
   * Create a new window margin
   * @param {int} left - the size of the margin on the left
   * @param {int} right - the size of the margin on the right
   * @param {int} top - the size of the margin on the top
   * @param {int} bottom - the size of the margin on the bottom
   */
  constructor (left, right, top, bottom) {
    this.left = left;
    this.right = right;
    this.top = top;
    this.bottom = bottom;
  }
}

/** a class that stores the dimensions of the svg elements */
class WindowDimensions {
  /**
   * Create a new window dimensions
   * @param {int} width - the width of just the element
   * @param {int} height - the width of just the element
   * @param {WindowMargin} margin - the margin object
   */
  constructor (width, height, margin = new WindowMargin(0, 0, 0, 0)) {
    this.width = width;
    this.height = height;
    this.margin = margin;
  }

  /**
   * function to get the full height of the window including margins
   * @returns height + top margin + bottom margin
   */
  getFullHeight () {
    return this.height + this.margin.top + this.margin.bottom;
  }

/**
 * function to get the full width of the window including margins
 * @returns width + left margin + right margin
 */
  getFullWidth () {
    return this.width + this.margin.left + this.margin.right;
  }
}

/** the width for the svg elements to be, calculated based on window width so that the svg elements scale with the device */
let windWidth = window.innerWidth * 0.7;
if (windWidth > 800) {
  windWidth = 800;
}

const svg1Margin = new WindowMargin(window.innerWidth * 0.05, 30, 30, 200);
const svg1Dimensions = new WindowDimensions(windWidth, 450, svg1Margin);
  // simple bar chart adapted from D3 Graph Gallery 2023

  /** An object which holds data about the dimensions of the first svg element */

// append the svg object to the body of the page
/** the svg element for the first chart */
const svg1 = d3.select('#DS1Container')
  .append('svg')
    .attr('width', svg1Dimensions.getFullWidth())
    .attr('height', svg1Dimensions.getFullHeight())
  .append('g')
    .attr('transform', `translate(${svg1Dimensions.margin.left},${svg1Dimensions.margin.top})`);

// Parse the Data
d3.csv('Books_Dataset.csv').then(function (data) {
    data = data.slice(0, 25);

// X axis

/** The svg element for the first chart's x axis */
const x = d3.scaleBand()
  .rangeRound([0, svg1Dimensions.width])
  .range([0, svg1Dimensions.width])
  .domain(data.map(d => d.title))
  .padding(0.2);
svg1.append('g')
  .attr('transform', `translate(0, ${svg1Dimensions.height})`)
  .call(d3.axisBottom(x))
  .selectAll('text')
    .attr('transform', 'translate(-10,10)rotate(-90)')
    .style('text-anchor', 'end');

// Add Y axis

/** the svg element for the first chart's y axis */
const y = d3.scaleLinear()
  .domain([0, 5])
  .range([svg1Dimensions.height, 0]);
svg1.append('g')
  .call(d3.axisLeft(y));

  // tooltip adapted from D3 Graph Gallery 2023

  // ----------------
  // Create a tooltip
  // ----------------
  const tooltip = d3.select('#DS1Container')
    .append('div')
    .style('opacity', 0)
    .attr('class', 'tooltip')
    .style('background-color', 'white')
    .style('border', 'solid')
    .style('border-width', '1px')
    .style('border-radius', '5px')
    .style('width', 'fit-content')
    .style('padding', '10px');

  // Three function that change the tooltip when user hover / move / leave a cell

  /** the function that is called when the user mouses over the bars on the chart
   * @param {event} event - the mouse event details
   * @param {data} d - the data from the chart
   */
  const mouseoverSvg1 = function (event, d) {
    tooltip
        .html('<strong>Title</strong>: ' + d.title +
          '<br><strong>Publisher: </strong>' + d.publisher +
          '<br><strong>Average Rating: </strong>' + d.average_rating +
          '<br><strong>Author(s): </strong>' + d.authors)
         .style('opacity', 1);
  };

  /** the function that is called when the user's mouse moves over the bars on the chart
   * @param {event} event - the mouse event details
   * @param {data} d - the data from the chart
   */
  const mousemoveSvg1 = function (event, d) {
    tooltip.style('transform', 'translateY(0%)')
           .style('left', (event.x) + 'px')
           .style('top', (event.y) - 30 + 'px');
  };

  /** the function that is called when the user's mouse exits the bars on the chart
   * @param {event} event - the mouse event details
   * @param {data} d - the data from the chart
   */
  const mouseleaveSvg1 = function (event, d) {
    tooltip
      .style('opacity', 0);
  };

// Bars
svg1.selectAll('mybar')
  .data(data)
  .join('rect')
    .attr('x', d => x(d.title))
    .attr('y', d => y(d.average_rating))
    .attr('width', x.bandwidth())
    .attr('height', d => svg1Dimensions.height - y(d.average_rating))
    .attr('fill', '#ff1717')
      .on('mouseover', mouseoverSvg1)
      .on('mousemove', mousemoveSvg1)
      .on('mouseleave', mouseleaveSvg1);
});

// end of code for the bar chart

//= ================================================================================================

// code for the pie chart

/** This function turns the data about books into data about the publishers
 *  and returns the data as an array with the first entry being an object
 *  with the data about all publishers and the second entry in the array being
 *  an object with the data about only publishers with more than one book in the dataset
 * @param {string} fileName - the name of the file containing the book data**/
function getData (fileName) {
  const publishersData = {};
  const topPublishersData = {};

d3.csv(fileName).then(function (data) {

  //looping through each piece of data

  for (let i = 0; i < data.length; i++) {
    const publisher = data[i].publisher;

    //going through each piece of data and adding each publisher to the publisher data object

    if (publishersData[publisher] === undefined) {
      publishersData[publisher] = 1;
    } else { publishersData[publisher] += 1; }
}

  for (const pub in publishersData) {
    if (publishersData[pub] > 1) {

      //if the publisher has more than 1 book published they are added to the top publishers data

      topPublishersData[pub] = publishersData[pub];
    }
  }
});
  return [publishersData, topPublishersData];
}

/** all the data returned by the getData function */
const data = getData('Books_Dataset.csv');

/** the data about the number of books published by all the publishers */
const publishersData = data[0];

/** the data about the number of books published by the top publishers */
const topPublishersData = data[1];

// pie chart code adapted from D3 Graph Gallery 2023

// set the dimensions and margins of the graph

/** a WindowDimensions class to store the data for the pie chart */
const svg2Dimensions = new WindowDimensions(windWidth, windWidth);

/** the width of the pie chart svg element */

// The radius of the pieplot is half the width or half the height (smallest one).
/** the radius of the circle used in the pie chart */
const svg2radius = Math.min(svg2Dimensions.getFullWidth(), svg2Dimensions.getFullHeight()) / 2.5;

// this is some of my code to tell you what data you are hovering over on the pie chart
/** the function called when the user mouses over sections of the pie chart, displaying information about the section */
const mouseoverSvg2 = function (event, d) {
  document.getElementById('pubInfo').innerHTML = ('<strong>Publisher: </strong>' + Object.entries(d)[0][1][0] +
                                                  '<br><strong>Books Published: </strong>' + Object.entries(d)[0][1][1]);
};

// append the svg object to the div called 'my_dataviz'
/** the svg element for the pie chart */
const svg2 = d3.select('#DS2Container')
  .append('svg')
    .attr('width', svg2Dimensions.getFullWidth())
    .attr('height', svg2Dimensions.getFullHeight())
  .append('g')
    .attr('transform', `translate(${svg1Dimensions.getFullWidth() / 2}, ${svg2Dimensions.getFullHeight() / 2})`);

// create 2 data_set

// set the color scale
/** the color scale used in the pie chart */
const svg2color = d3.scaleOrdinal()
  .range(d3.schemeDark2);

// A function that create / update the plot for a given variable:

/** This code was adapted from <a href="https://d3-graph-gallery.com/graph/pie_changeData.html"> D3 Graph Gallery 2023 </a>
 * it updates the pie chart with new data when the buttons are pressed based on the data given to the function
 * @param {data} data - the data to be displayed on the pie chart**/
function update (data) {
  console.log('updating');

  // Compute the position of each group on the pie:
  /** The pie chart d3 element used to compute the position of each data group on the char */
  const pie = d3.pie()
    .value(function (d) { return d[1]; })
    .sort(function (a, b) { return d3.ascending(a.key, b.key); }); // This make sure that group order remains the same in the pie chart
  const dataReady = pie(Object.entries(data));

  // map to data
  /** The paths for the pie chart */
  const u = svg2.selectAll('path')
    .data(dataReady);

  // shape helper to build arcs:

  // Build the pie chart: Basically, each part of the pie is a path that we build using the arc function.
  u
    .join('path')
    .attr('d', d3.arc()
      .innerRadius(0)
      .outerRadius(svg2radius))
    .attr('fill', function (d) { return (svg2color(d.data[0])); })
    .attr('stroke', 'white')
    .style('stroke-width', '2px')
    .style('opacity', 1)
    .on('mouseover', mouseoverSvg2);
}

/** The button used to update the pie chart with all publisher data */
const butn1 = document.getElementById('btn1');

/** The button used to update the pie chart with top publisher data */
const butn2 = document.getElementById('btn2');

butn1.addEventListener('click', function () {
  update(publishersData);
  butn1.style = 'color:blue';
  butn2.style = 'color:black';
  });

butn2.addEventListener('click', function () {
  update(topPublishersData);
  butn2.style = 'color:blue';
  butn1.style = 'color:black';
  });
