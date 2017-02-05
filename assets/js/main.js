var portfolio = {}

portfolio.Section = {
    SHOWN: false,
    init: function() {},
    //TODO check if needed
    setShown: function(shown) {
        this.SHOWN = shown;
    },

    isShown: function() {
        return this.SHOWN;
    }
}

portfolio.About = $.extend(true, {}, portfolio.Section, {
    init: function() {
        //do things for section
        $('#home h1').css({opacity: '1', animation: 'bounce-from-top 0.5s ease-out'});
        $('#home p').css({opacity: '1', animation: 'bounce-from-bottom 0.5s ease-out'});
    }
});

portfolio.Skills = $.extend(true, {}, portfolio.Section, {
    init: function() {
        //do things for section
        this.createChart();
    },

    createChart: function(){
        //This function was based on http://bl.ocks.org/cmdoptesc/6228457

        //Data to be displayed. Edit as desired
        //Note: this code will expect the same length on both datasets.
        var dataFront = [{
            skill: 'CSS',
            value: 10
        },{
            skill: 'HTML',
            value: 90
        },{
            skill: 'Javascript',
            value: 75
        },{
            skill: 'Angular',
            value: 20
        },{
            skill: 'Sass/Less',
            value: 75
        }];

        var dataBack = [{
            skill: 'PHP',
            value: 10
        },{
            skill: 'MySQL',
            value: 40
        },{
            skill: 'LAMP',
            value: 35
        },{
            skill: 'Kohana',
            value: 50
        },{
            skill: 'Sarasa',
            value: 25
        }]; 

        //Define constants
        var FRONT = 'Front-end'; // text to be displayed on the button
        var BACK = 'Back-end';
        var currentRender = FRONT;

        var width = $('.chart-container').width(); //960
        var height = $('.chart-container').height(); //500;

        var PI = Math.PI;
        
        // Edit these props to change the chart style
        var arcMin = 75; // inner radius of the first arc
        var arcWidth = 25;
        var arcPad = 1;
        var transitionDuration = 300;
        var colorFrom = '#dadada';
        var colorTo = '#3e3e3e';
        var buttonColor = 'rgba(201, 201, 201, 0.5)'; //if changed, update fill value of .click-circle.highlighted in skills.scss

        //chart will be placed in the middle of the svg
        var translate = 'translate('+width/2+', '+ height/2+')';


        // append svg to the DIV
        d3.select('.chart-container').append('svg:svg')
            .attr('width', width)
            .attr('height', height);

        var render = function(dataset) {
            //scale to use 1 to 100 values
            var scaleTo100 = d3.scale.linear().domain([0, 100]).range([0, 2 * PI]); 
            //color scale
            var colorScale = d3.scale.linear().domain([0, 100]).range([d3.rgb(colorFrom), d3.rgb(colorTo)]);

            var svg = d3.select('svg'); 

            //arc accessor
            var drawArc = d3.svg.arc()
                .innerRadius(function(d, i) {
                    return  arcMin + i*(arcWidth) + arcPad;
                })
                .outerRadius(function(d, i) {
                    return arcMin + (i+1)*(arcWidth);
                })
                .startAngle(0)
                .endAngle(function(d){ return scaleTo100(d.value)});
            
            // bind the data
            var skillArcs = svg.selectAll('path.skill-arc').data(dataset);



            // custom tween function used by the attrTween method to draw the intermediary steps.
            // attrTween will actually pass the data, index, and attribute value of the current
            // DOM object to this function, but for our purposes, we can omit the attribute value
            function arc2Tween(d, indx) {
                // this will return an interpolater function that returns values between 
                //'this._current' and 'd' given an input between 0 and 1
                var interp = d3.interpolate(this._current, d.value);    

                // update this._current to match the new value
                this._current = d.value;  

                // returns a function that attrTween calls with a time input between 0-1; 0 as the
                // start time, and 1 being the end of the animation              
                return function(t) {
                    // use the time to get an interpolated value`(between this._current and d)                  
                    d.value = interp(t)                 

                    // pass this new information to the accessor
                    // function to calculate the path points.

                    // n.b. we need to manually pass along the
                    //  index to drawArc so since the calculation of
                    //  the radii depend on knowing the index.
                    return drawArc(d, indx);
                }
            };

          

            // update arcs using attrTween and a custom tween function arc2Tween
            skillArcs.transition()
                .duration(transitionDuration)
                .attr('fill', function(d){
                    return colorScale(d.value);
                })
                .attrTween('d', arc2Tween);         
                // using attrTween instead of attr here since
                //  attr interpolates linearly without taking
                //  into account the shape of the arc.
                // attrTween requires a function as the second
                //  argument, whereas attr can just be a value.

          
            // drawing the arcs with the data
            skillArcs.enter().append('svg:path')
                .attr('class', 'skill-arc')
                .attr('id', function(d,i) { return 'skill-arc-'+i; })
                .attr('transform', translate)
                .attr('fill', function(d){
                    return colorScale(d.value);
                })
                .attr('d', drawArc)
                .each(function(d){
                    this._current = d.value;
                });

          // add the labels to each arc or update the text
            var labels = svg.selectAll('.skill-label');
            if(labels[0].length == 0){
                renderText();
            }else{
               updateText();
             };

            function renderText() {
                labels.data(dataset)
                    .enter().append('text')
                    .attr('class', 'skill-label')
                    .attr('x', 5) //Move the text from the start angle of the arc
                    .attr('dy', 18) //Move the text down
                    .append('textPath')
                    .attr('class', 'skill-label-path')
                    .attr('xlink:href',function(d,i){return '#skill-arc-'+i;})
                    .text(function(d){ return d.skill; });
            };

            function updateText() {
                var paths = svg.selectAll('textPath.skill-label-path');
                paths.data(dataset)
                    .transition().duration(transitionDuration/2)
                    .style('opacity', 0)
                    .transition().duration(transitionDuration/2)
                    .style('opacity', 1)
                    .text(function(d) { return d.skill; })
            }
        };

        var initialize = function() {
            //render the chart
            render(dataFront);

            // making the click circle if not exists
            if(!d3.selectAll("circle.click-circle")[0].length) {

                // making the click circle for red arcs
                d3.select('svg').append('circle')
                    .attr('class', 'click-circle')
                    .attr('transform', translate)
                    .attr('r', arcMin*0.85)
                    .attr('fill', buttonColor)
                    .on('click', function() {
                        var data = toggleData();
                        toggleButton();
                        render(data);
                    })
                    .on('mouseover', function() {
                        d3.select(this).classed('highlighted', true);
                    })
                    .on('mouseout', function() {
                        d3.select(this).classed('highlighted', false);
                    });

                // add the label to the button
                d3.select('svg').append('text')
                    .text(currentRender)
                    .attr('class', 'skills-button-text')
                    .attr('x', getButtonTextPosition)
                    .attr('y', height/2 + 5)
                    .on("click", function() {
                      var data = toggleData();
                      toggleButton();
                      render(data);
                    }).on('mouseover', function() {
                        d3.select('circle.click-circle').classed('highlighted', true);
                    })
                    .on('mouseout', function() {
                        d3.select('circle.click-circle').classed('highlighted', false);
                    });
            }
        }

        // toggle dataset 
        var toggleData = function(){
            var data;
            if(currentRender == FRONT){
                data = dataBack; 
                currentRender = BACK; 
            } else {
                data = dataFront;
                currentRender = FRONT;
            }
            return data;
        }

        // toggle button text 
        var toggleButton = function(){
            d3.select('svg').select('text.skills-button-text')
                .transition().duration(transitionDuration/2)
                .style('opacity', 0)
                .each('end', changeText) // changes the text when the opacity is 0 
                .transition().duration(transitionDuration/2)
                .style('opacity', 1);

            function changeText(){
                d3.select('svg').select('text.skills-button-text')
                  .text(currentRender)    
                  .attr('x', getButtonTextPosition);
            }        
        }

        // calculates and returns the button's label position to be centered
        var getButtonTextPosition = function(){
            var circleWidth = arcMin*0.85 * 2
            var bbox = this.getBBox();
            var textwidth = bbox.width;
            var dif = circleWidth - textwidth;
            var offset = dif/2;
            var position = (width/2 - arcMin*0.85) + offset;
            return position;
        }

        //run the code!
        initialize();
    }
});

portfolio.Common = {
   
    init : function() 
    {	
        this.scrollTo();
        this.showcase();

    },

    scrollTo: function(){
    	$('a[href^="#"]').on('click', function(event) {
		    var $target = $(this.getAttribute('href'));
		    if( $target.length ) {
		        event.preventDefault();
		        $('html, body').stop().animate({
		            scrollTop: $target.offset().top
		        }, 1000);
		    }
		});
    },

    showcase: function(){
        $("#showcase").flickity({
            wrapAround: true,
            pageDots: false
        });
    }
}

portfolio.EventHandler = {
    events: {
        SECTION_SHOWN: 'sectionShown',
    },

    register: function(name, callback) {
        callback = callback || 0;
        $(document).on(name, callback);    
    },

    fire: function(name, data){
        data = data || false,
        $(document).trigger(name, data);
    }
}
//usage
// var evt = portfolio.EventHandler.events.SECTION_SHOWN;
// var data = {section: 'about'};
// portfolio.EventHandler.fire(evt, data);

// var evt = portfolio.EventHandler.events.SECTION_SHOWN;
// var callback = function(event, data){
//     if(!t.isShown() && data.section == 'about') {
//         console.log('do tricks for about');
//     }
    
//     t.setShown(true);
// }

// portfolio.EventHandler.register(evt, callback);

{
    $(window).on('load',function() {
        portfolio.Common.init();
        portfolio.About.init();
        portfolio.Skills.init();

        ( function( $ ) {
            // Init Skrollr
            var s = skrollr.init({
                render: function(data) {
                    //Debugging - Log the current scroll position.
                    //console.log(data.curTop);
                }
            });
        } )( jQuery );
    });
}

