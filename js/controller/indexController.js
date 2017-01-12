/**
 * Created by Pavan on 1/9/2017.
 */

angular.module('codingChallenge', [])

    .controller('indexController',['$scope', '$window', 'httpService', '$interval', function($scope, $window, httpService, $interval) {


        var n = 40,
            duration = 1000,
            now = new Date('1995-12-17T03:24:00Z'),
            random = d3.random.normal(0, 0.2),
            count = 0,
            data = d3.range(n).map(random);

        var margin = {
                top: 20,
                right: 10,
                bottom: 20,
                left: 60
            },
            width = 1000 - margin.left - margin.right,
            height = 400 - margin.top - margin.bottom - 10;

        var x = d3.time.scale()
            .domain([0, now - duration])
            .range([0, width]);

        var y = d3.scale.linear()
            .domain([0, d3.max(data)])
            .range([height, 0]);



        var line = d3.svg.line()
            .interpolate("basis")
            .x(function (d, i) {
                return x(now - (n - 1 - i) * duration);
            })
            .y(function (d, i) {
                return y(d);
            });

        var svg = d3.select("line").append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        svg.append("defs").append("clipPath")
            .attr("id", "clip")
            .append("rect")
            .attr("width", width)
            .attr("height", height);



        var axis = svg.append("g")
            .attr("class", "x-axis")
            .attr("transform", "translate(0," + height + ")")
            .call(x.axis = d3.svg.axis().scale(x).orient("bottom").tickFormat(d3.time.format("%X")))



        var yAx = svg.append("g")
            .attr("class", "y axis")

            .call(y.axis = d3.svg.axis().scale(y).orient("left"));

        var path = svg.append("g")
            .attr("clip-path", "url(#clip)")
            .append("path")
            .datum(data)
            .attr("class", "line");


        var transition = d3.select({}).transition()
            .duration(1000)
            .ease("linear");

        tick(0);

        function tick(newVal) {

            if(typeof newVal == 'object') {

                var axisVal = localStorage['axis'],
                    arrValue, labelText;

                switch (axisVal) {
                    case '1':
                        arrValue = parseFloat(newVal.data[0].cpu_usage);
                        labelText = 'CPU Usage';
                        break;
                    case '2':
                        arrValue = parseFloat(newVal.data[0].memory_available);
                        labelText = 'Memory Available';
                        break;
                    case '3':
                        arrValue = parseFloat(newVal.data[0].memory_usage);
                        labelText = 'Memory Usage';
                        break;
                    case '4':
                        arrValue = parseFloat(newVal.data[0].network_throughput.in);
                        labelText = 'N/W Throughput - In';
                        break;
                    case '5':
                        arrValue = parseFloat(newVal.data[0].network_throughput.out);
                        labelText = 'N/W Throughput - Out';
                        break;
                    default:
                        arrValue = parseFloat(newVal.data[0].cpu_usage);
                        labelText = 'CPU Usage';
                }

            }else{
                arrValue = newVal
            }
            // update the domains
            now = new Date();
            x.domain([now - (n - 2) * duration, now - duration]);
            y.domain([0, d3.max(data) + 10]);


            // push a new data point onto the back

            data.push(arrValue);

            // redraw the line, and slide it to the left
            path.attr("d", line)
                .attr("transform", null);


            // Add the text label for the Y axis
            svg.append("text")
                .attr("transform", "rotate(-90)")
                .attr("y", 0 - margin.left - 5)
                .attr("x",0 - (height / 2))
                .attr("dy", "1em")
                .style("text-anchor", "middle")
                .text(labelText);
            // slide the x-axis left, rescale the y-axis
            axis.call(x.axis);
            yAx.call(y.axis);

            // slide the line left
            path.transition()
                .attr("transform", "translate(" + x(now - (n - 1) * duration) + ")");

            // pop the old data point off the front
            data.shift();

        }

        // Configurable Y Axis
        $scope.yAxis = function(axis){

            localStorage['axis'] = axis;
            tick(0);
            $window.location.reload();
        }

        // Retrieve data from the API
        var getData = function(serverID){
            var startTime = new Date(),
                endTime = new Date(startTime.getTime() + 1000),
                queryParam = ["from=", startTime.getTime(), "&to=", endTime.getTime()].join(""),
                url = ["/server_stat/",serverID, "?" + queryParam].join("");
            httpService.callRestApi(null, url, "GET")
                .then(function(response){

                    tick(response);

                } ,
                function(reason){
                    //  console.log(reason);

                    tick(-1);
                });


        }

        $scope.initFunction = function(){
            $interval(function(){
                getData('s1')}, 1000);
        }

        // Task 3
        $scope.sendData = function(userData){
            var url = "/server_stat";
            //Angular Service for API call
            httpService.callRestApi(userData, url, "POST")
                .then(function(response){
                    console.log(response);
                    alert("Data entry successful.");
                    scope.data = {};
                } ,
                function(reason){
                    console.log(reason);
                });


        }
    }]);