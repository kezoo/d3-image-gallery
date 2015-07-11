    /**
     * Created on 7/11/2015.
     */

    window.onload = function() {
        var winWidth = window.innerWidth, winHeight = window.innerHeight;
        document.body.style.height = winHeight + "px";

        var dataset;
        var svgWidth = winWidth * 0.9, svgHeight = winHeight * 0.9, svgPad = 20;
        var widthArr = [], heightArr = [], sizeArr = [];
        var widthMax, heightMax, sizeMax;
        var circleScale = 1.5;

        var svg = d3.select("body").append("svg");

        function draw(data) {
            dataset = Object.keys(data).map(function(k) { return data[k] });;
            var dataLen = dataset.length;
            for ( var i = 0; i < dataLen; i++ ) {
                widthArr.push(dataset[i].width);
                heightArr.push(dataset[i].height);
                sizeArr.push(dataset[i].filesize);
            }

            widthMax = Math.max.apply(Math, widthArr);
            heightMax = Math.max.apply(Math, heightArr);
            sizeMax = Math.max.apply(Math, sizeArr);

            svg.attr("width", svgWidth).attr("height", svgHeight);
            var circles = svg.selectAll("circle")
              .data(dataset)
              .enter()
              .append("circle");

            var scale = d3.scale.linear();
            var xScale = d3.scale.linear()
              .domain([0, widthMax + 300])
              .range([svgPad, svgWidth - svgPad*2]);

            var yScale = d3.scale.linear()
              .domain([ 0, heightMax + 100])
              .range([svgHeight - svgPad, svgPad*2]);

            var rScale = d3.scale.linear()
              .domain([ 0, sizeMax])
              .range([ 0, svgPad * 2 ]);

            circles.attr("cx", function(d) {
                return Math.floor(xScale(d.width));
            }).attr('cy', function(d) {
                return Math.floor(yScale(d.height));
            }).attr('r', function(d) {
                return Math.floor(rScale(d.filesize));
            });

            var xAxis = d3.svg.axis()
              .scale(xScale)
              .orient("bottom");
            svg.append("g")
              .attr('class', 'axis')
              .attr("transform", "translate(" +  svgPad + " ," + (svgHeight - svgPad) + ")")
              .call(xAxis);

            var yAxis = d3.svg.axis()
              .scale(yScale)
              .orient("left");
            svg.append("g")
              .attr('class', 'axis')
              .attr("transform", "translate(" +  svgPad*2 + " , 0 )")
              .call(yAxis);

            init();
        }

        function init() {
            svg.append('line')
              .attr('class', 'tipLine')
              .attr("pointer-events", "none");

            svg.append('rect')
              .attr('class', 'tipRect')
              .attr('fill', 'white')
              .attr("pointer-events", "none");

            svg.append('rect')
              .attr('class', 'imgRect')
              .attr('width', 80)
              .attr('height', 80)
              .attr('fill', 'none');

            svg.append('text')
              .attr('class', 'info imgMt');

            svg.append('text')
              .attr('class', 'name imgMt');

            svg.append('text')
              .attr('class', 'width imgMt');

            svg.append('text')
              .attr('class', 'height imgMt');

            svg.append('text')
              .attr('class', 'size imgMt');

            svg.append('text')
              .attr('class', 'path imgMt');
        }

        function displayRect(x, y ) {
            d3.select('.tipRect')
              .attr('x', x + 50)
              .attr('y', y - 60)
              .attr('width', 0)
              .attr('height', 0)
              .transition()
              .duration(100)
              .attr('width', 200)
              .attr('height', 210);
        }

        function hideRect() {
            d3.select('.tipRect')
              .attr('x', null)
              .attr('y', null)
              .attr('width', null)
              .attr('height', null)
        }

        function displayInfo(x, y, imgMeta) {
            svg.append("defs")
              .append('pattern')
              .attr('id', 'thumb')
              .attr('width', 80)
              .attr('height', 80)
              .append('image')
              .attr("xlink:href", imgMeta.thumbpath)
              .attr('width', 80)
              .attr('height', 80);

            d3.select('.imgRect')
              .attr('x', x + 60 )
              .attr('y', y - 60)
              .attr('fill', 'url(#thumb)');

            d3.select('.info')
              .attr('x', x + 60)
              .attr('y', y + 120)
              .text("Desc : " + imgMeta.description)

            d3.select('.name')
              .attr('x', x + 60)
              .attr('y', y + 20)
              .text("Name : " + imgMeta.filename)

            d3.select('.width')
              .attr('x', x + 60)
              .attr('y', y + 40)
              .text("Width : " + imgMeta.width)

            d3.select('.height')
              .attr('x', x + 60)
              .attr('y', y + 60)
              .text("Height : " + imgMeta.height)

            d3.select('.size')
              .attr('x', x + 60)
              .attr('y', y + 80)
              .text("File size : " + imgMeta.filesize)

            d3.select('.path')
              .attr('x', x + 60)
              .attr('y', y + 100)
              .text("File path : " + imgMeta.filepath)
        }

        function removeInfo() {
            svg.select('defs').remove();
            svg.select('.imgRect').attr('fill', 'none');
            d3.selectAll('.imgMt').text('');
        }

        function strokeLine(x, y, imgMeta) {
            d3.select('.tipLine')
              .attr('x1', x)
              .attr('y1', y)
              .attr('x2', x)
              .attr('y2', y)
              .transition()
              .duration(100)
              .attr('x2', x + 50)
              .each('end',displayRect(x, y));

            displayInfo(x, y, imgMeta)
        }

        function destroyLine() {
            d3.select('.tipLine')
              .attr('x1', null)
              .attr('y1', null)
              .attr('x2', null)
              .attr('y2', null);
        }



        d3.json("data.json", function(data) {
            draw(data);
            d3.selectAll("circle")
              .on("mouseover", function(d) {
                  var r = Number(d3.select(this).attr("r")),
                    x = Number(d3.select(this).attr('cx')) + r,
                    y = Number(d3.select(this).attr('cy'));

                  d3.select(this)
                    .transition()
                    .duration(100)
                    .attr("r", r * circleScale)
                    .each('end', strokeLine(x + r/2, y, d));
              })
              .on("mouseleave", function() {
                  var r = d3.select(this).attr("r");
                  d3.select(this)
                    .attr("r", r / circleScale)
                  destroyLine();
                  hideRect();
                  removeInfo();
              });
        });
    }


