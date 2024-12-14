import React, { Component } from "react";
import "./Graph.css";
import * as d3 from "d3";

class Graph extends Component {
  state = {
    c: "Sentiment",
    activeTweets: [],
  };

  constructor(props) {
    super(props);
    this.isRendered = false;
  }

  colorcats = (event) => {
    const c = event.target.value;
    this.setState({ c }, () => {
      this.applyColorScheme();
      d3.select('.legend').remove();
      this.createLegend(this.state.c, this.defineColorScale(this.state.c));
    });
  };

  componentDidUpdate(prevProps, prevState) {
    if (!this.isRendered && this.props.csv_data.length > 0) {
      this.drawVisual();
      this.isRendered = true;
    }

    if (prevState.c !== this.state.c) {
      this.applyColorScheme();
      this.createLegend();
    }
  }

  defineColorScale = (category) => {
    return category === "Sentiment"
      ? d3.scaleLinear().domain([-1, 0, 1]).range(["red", "#ECECEC", "green"])
      : d3.scaleLinear().domain([0, 1]).range(["#ECECEC", "#4467C4"]);
  };

  applyColorScheme = () => {
    const { csv_data, c } = this.props;
    const colorScale = this.defineColorScale(c);

    d3.select(".forceLayout")
      .select("g")
      .selectAll("circle")
      .data(csv_data)
      .attr("fill", (d) => colorScale(d[c]));
  };

  createLegend = (category, colorScale) => {
    const svg = d3.select(".forceLayout").select("g");
    const height = 600;
    const legendWidth = 20;
    const legendHeight = 300;

    const legend = svg
      .append("g")
      .attr("class", "legend")
      .attr("transform", `translate(${legendWidth + 600}, ${height / 2 - legendHeight / 2})`);

    const stops =
      category === "Sentiment"
        ? [
            { offset: "0%", color: "green" },
            { offset: "50%", color: "#ECECEC" },
            { offset: "100%", color: "red" },
          ]
        : [
            { offset: "0%", color: "#4467C4" },
            { offset: "100%", color: "#ECECEC" },
          ];

    const gradient = legend
      .append("defs")
      .append("linearGradient")
      .attr("id", "legend-gradient")
      .attr("gradientTransform", "rotate(90)");

    gradient
      .selectAll("stop")
      .data(stops)
      .enter()
      .append("stop")
      .attr("offset", (d) => d.offset)
      .attr("stop-color", (d) => d.color);

    legend
      .append("rect")
      .attr("width", legendWidth)
      .attr("height", legendHeight)
      .style("fill", "url(#legend-gradient)");

    const labels = category === "Sentiment" ? ["Positive", "Negative"] : ["Subjective", "Objective"];

    legend
      .selectAll(".legend-label")
      .data(labels)
      .enter()
      .append("text")
      .attr("class", "legend-label")
      .attr("x", legendWidth + 5)
      .attr("y", (d, i) => i * legendHeight)
      .attr("dy", (d, i) => (i === 0 ? "1em" : "-0.5em"))
      .attr("text-anchor", "start")
      .text((d) => d);
  };
  drawVisual = () => {
    const { csv_data } = this.props;
    const { c } = this.state;

    const margin = { top: 125, right: 40, bottom: 125, left: 40 };
    const width = 800;
    const height = 850;
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const svg = d3
      .select(".forceLayout")
      .attr("width", width)
      .attr("height", height)
      .select("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const monthCoordinates = {
      March: { x: innerWidth / 2, y: innerHeight / 5 },
      April: { x: innerWidth / 2, y: innerHeight / 2 },
      May: { x: innerWidth / 2, y: 3 * (innerHeight / 4) },
    };

    const verticalSpacing = 250;
    const yOffset = -50;
    svg
      .selectAll(".month-label")
      .data(Object.keys(monthCoordinates))
      .join("text")
      .attr("class", "month-label")
      .attr("x", -margin.left + 10)
      .attr("y", (d, i) => i * verticalSpacing + margin.top + yOffset)
      .attr("dy", "0.35em")
      .attr("text-anchor", "start")
      .style("font-size", "18px")
      .style("font-weight", "bold")
      .text((d) => d);
    const sentimentColorScale = d3
      .scaleLinear()
      .domain([-1, 0, 1])
      .range(["red", "#ECECEC", "green"]);
    const subjectivityColorScale = d3
      .scaleLinear()
      .domain([0, 1])
      .range(["#ECECEC", "#4467C4"]);

      let colorScale;
      if (c === "Sentiment") {
        colorScale = sentimentColorScale;
      } else {
        colorScale = subjectivityColorScale;
      }
    const simulation = d3
      .forceSimulation(csv_data)
      .force("charge", d3.forceManyBody().strength(-2))
      .force(
        "x",
        d3.forceX((d) => monthCoordinates[d.Month]?.x || innerWidth / 2).strength(0.1)
      )
      .force(
        "y",
        d3.forceY((d) => monthCoordinates[d.Month]?.y || innerHeight / 2).strength(0.1)
      )
      .force("collide", d3.forceCollide(4))
      .on("tick", this.updatePositions);
    const nodes = svg
      .selectAll("circle")
      .data(csv_data)
      .join("circle")
      .attr("r", 3.5)
      .attr("fill", (d) => colorScale(d[c]))
      .on("click", this.twtClick);
    this.createLegend(c, colorScale);
  };
  updatePositions = () => {
    const nodes = d3.selectAll("circle");
    nodes.attr("cx", (d) => d.x).attr("cy", (d) => d.y);
  };
  twtClick = (event, d) => {
    this.setState((prevState) => {
      const ind = prevState.activeTweets.findIndex((tweet) => tweet.idx === d.idx);
      let newActiveTweets = [...prevState.activeTweets];

      if (ind > -1) {
        newActiveTweets.splice(ind, 1);
        d3.select(event.target).attr("stroke", "none").attr("stroke-width", 0);
      } else {
        newActiveTweets.unshift(d);
        d3.select(event.target).attr("stroke", "black").attr("stroke-width", 2);
      }

      return { activeTweets: newActiveTweets };
    });
  };
  render() {
    const isDataLoaded = this.props.csv_data.length > 0;

    return (
      <div>
        {isDataLoaded && (
          <div className="dropdown-container">
            <label>Color By: </label>
            <select value={this.state.c} onChange={this.colorcats}>
              <option value="Sentiment">Sentiment</option>
              <option value="Subjectivity">Subjectivity</option>
            </select>
          </div>
        )}
    
        <svg className="forceLayout">
          <g></g>
        </svg>
    
        <div className="tweets-container">
          {this.state.activeTweets.map((tweet) => (
            <div key={tweet.idx} className="tweet-card">
              <p>{tweet.RawTweet}</p>
            </div>
          ))}
        </div>
      </div>
    );    
  }
}

export default Graph;
