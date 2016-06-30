var MOBILE_THRESHOLD = 700;
var data_url = "data/sdh.csv";

var isMobile = false;
var $graphic = $('#graphic');
var COLORS = ["#1696d2", "#d2d2d2"];
var numticks = 6;
var HARDSHIPS = {
    hardship1: "Received public benefits",
    hardship2: "Missed utility payment",
    hardship3: "Missed housing payment",
    hardship4: "Evicted"
};


function wrap(text, width) {
  text.each(function() {
    var text = d3.select(this),
        words = text.text().split(/\s+/).reverse(),
        word,
        line = [],
        lineNumber = 0,
        lineHeight = 1.1, // ems
        y = text.attr("y"),
        dy = parseFloat(text.attr("dy")),
        x = text.attr("x")
        tspan = text.text(null).append("tspan").attr("x", x).attr("y", y).attr("dy", dy + "em");
    while (word = words.pop()) {
      line.push(word);
      tspan.text(line.join(" "));
      if (tspan.node().getComputedTextLength() > width) {
        line.pop();
        tspan.text(line.join(" "));
        line = [word];
        tspan = text.append("tspan").attr("x", x).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
      }
    }
  });
}


function drawGraphic(container_width) {
    var TABLET = d3.select("#tabletTest").style("display") == "block"
    var PHONE = d3.select("#phoneTest").style("display") == "block"
    var LABELS = ["Workers have paid sick and vacation leave and pension or retirement contributions", "Neighborhood has sidewalks, parks or playgrounds, a recreation center, and a library", "Individuals in excellent or very good health"];
    var VALUES = ["leave", "ammenities", "health"];

    data.forEach(function (d) {
        d.health = +d.health;
        d.ammenities = +d.ammenities;
        d.leave = +d.leave;
    });

    if (container_width == undefined || isNaN(container_width)) {
        container_width = 1170;
    }

    var chart_aspect_height = .4;
    var margin = {
        top: 35,
        right: 75,
        bottom: 95,
        left: 130
    };

    var h;
    if(PHONE) h = 900;
    else if(TABLET) h = 600;
    else h = 300;

    var width = container_width - margin.left - margin.right,
        height = h - margin.top - margin.bottom;
    $graphic.empty();

    var svg = d3.select("#graphic").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom + 50)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");



    var max = [];
    //calculate spacing of segments
    for (i = 0; i < VALUES.length; i++) {
        max[i] = d3.max(data, function (d) {
            return (d[VALUES[i]]);
        });
    }
    var prop = [];
    for (i = 0; i < VALUES.length; i++) {
        prop[i] = 0.75 * max[i] / (max[0] + max[1] + max[2]);
    }

    var padding = 65;

    var STARTS = [-2, width * prop[0] + 18, width * (prop[0] + prop[1]) + 4, width * (prop[0] + prop[1] + prop[2])];

    var titles = svg.selectAll(".subtitle")
        .data(LABELS)
        .enter()
        .append("g")
        .attr("class", "subtitle");
    var textWidth;
    if(PHONE) textWidth = width+margin.right
    else if(TABLET) textWidth = width/2
    else textWidth = width/3 - 30
    titles.append("text")
        .attr("x", function (d, i) {
            if(PHONE){
                return -2
            }
            else if(TABLET){
                if(i == 0 || i == 2){
                    return -3
                }else{ return width/2 + 27}
            }
            else return STARTS[i] + i * padding;
        })
        .attr("y", function(d,i){
            if(PHONE){
                if(i == 0) return 225
                else if(i == 1) return 505
                else return 790
            }
            else if(TABLET){
                if(i == 0) return 215
                else if (i == 1) return 215
                else return 505
            }
            else return 200
        })
        .attr("dy",0)
        .attr("text-anchor", "start")
        .text(function (d, i) {
            return d;
        })
        .call(wrap, textWidth);

    var bars = svg.selectAll(".bar")
        .data(data)
        .enter()
        .append("g")
        .attr("class", "bar");

    var barlabels = svg.selectAll(".point-label")
        .data(data)
        .enter()
        .append("g")
        .attr("class", "point-label");

    for (i = 0; i < VALUES.length; i++) {
        range = [];
        if(PHONE){
            range = [0, width]
        }
        else if (TABLET){
            if(i == 0){
                range = [0, width/2]
            }
            else if(i == 1){
                range = [width/2+30, width]
            }else{
                range = [0, width/2]
            }
        }else{
            if(i == 0){
                range = [0, width/3-30]
            }
            else if(i == 1){
                range = [width/3+30,2*width/3]
            }else{
                range = [2*width/3+30, width]
            }
        }
        var x = d3.scale.linear()
            .range(range)
            .domain([0, .75]);
        var rangeY = []
        if(PHONE){
            if(i == 0) rangeY = [height/3-50,0]
            else if(i == 1) rangeY = [2*height/3-30,height/3 +20]
            else rangeY = [height, 2*height/3+50]
        }
        else if(TABLET){
            if(i == 0 || i == 1) rangeY = [height/2-50, 0]
            else rangeY = [height, height/2+50]
        }else rangeY = [height,0]
        var y = d3.scale.ordinal()
            .rangeRoundBands(rangeY, .1)
            .domain(data.map(function (d) {
                return d.assets;
        }));
    var yAxis = d3.svg.axis()
        .scale(y)
        .tickSize(0)
        .orient("left")
        .tickFormat(function(d){ return d.replace("-","–")});

    var gy = svg.append("g")
        .attr("class", "y axis-show a"  + String(i))
        .call(yAxis);
    gy.selectAll("text")
        .attr("dx", -4);
        bars.append("rect")
            .attr("class", VALUES[i] + "_0")
            .attr("x", x(0))
            .attr("width", function (d) {
                return Math.abs(x(0) - x(d[VALUES[i]]));
            })
            .attr("y", function (d, j) {
                 return y(d.assets) + 10;
            })
            .attr("height", y.rangeBand() - 10)

        barlabels.append("text")
            .attr("x", function (d) {
                return x(d[VALUES[i]]) + 4;
            })
            .attr("y", function (d) {
                return y(d.assets) + y.rangeBand() / 2 + 4;
            })
            .text(function (d) {
                return d3.format("%")(d[VALUES[i]]);
            });
    }

    d3.select("g.y.axis-show").node().parentNode.appendChild(d3.select("g.y.axis-show").node())


}