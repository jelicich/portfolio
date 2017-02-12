var portfolio = {}

portfolio.Section = {
    shown: false,
    init: function() {},
    //TODO check if needed
    setShown: function(shown) {
        this.shown = shown;
    },

    isShown: function() {
        return this.shown;
    }
}

portfolio.Home = $.extend(true, {}, portfolio.Section, {
    init: function() {
        //do things for section
        $('#home h1').css({opacity: '1', animation: 'bounce-from-top 0.5s ease-out'});
        $('#home p').css({opacity: '1', animation: 'bounce-from-bottom 0.5s ease-out'});
    }
});

portfolio.Skills = $.extend(true, {}, portfolio.Section, {
    currentData: 0,

    //Data to be displayed. Edit as desired
    data : [{
        set: 'Front-end',
        data: [{
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
        }]
    },
    {
        set: 'Back-end',
            data: [{
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
        }]
    },
    {
        set: 'Others',
            data: [{
            skill: 'Coffee',
            value: 90
        },{
            skill: 'Mate',
            value: 10
        },{
            skill: 'Small talk',
            value: 50
        },{
            skill: 'Ping Pong',
            value: 70
        },{
            skill: 'Foosball',
            value: 20
        }]
    }],

    config:{
        //Define constants
        width: $('.chart-container').width(),
        height: $('.chart-container').height(),

        PI: Math.PI,
        
        // Edit these props to change the chart style
        arcMin: 75, // inner radius of the first arc
        arcWidth: 25,
        arcPad: 1,
        transitionDuration: 500,
        colorFrom: '#dadada',
        colorTo: '#3e3e3e',
        buttonColor: 'rgba(201, 201, 201, 0.5)', //if changed, update fill value of .click-circle.highlighted in skills.scss. also this can be set in scss

        //chart will be placed in the middle of the svg
        translate: 'translate(' + $('.chart-container').width()/2 + ', ' + $('.chart-container').height()/2 + ')'
    },

    init: function() {
        var t = this;
        var initData = [{set: '',data: [{skill: '',value: 0},{skill: '',value: 0},{skill: '',value: 0},{skill: '',value: 0},{skill: '',value: 0}]}];
        
        //Note: this code will expect the same length on every dataset.
        this.startChart(initData);

        //listener to update the chart with the proper data
        var waypoint = new Waypoint({
            element: document.getElementById('chart'),
            handler: function() {
                if(!portfolio.Skills.isShown()) {
                    portfolio.Skills.setShown(true);
                    t.renderChart(t.data[t.currentData].data)
                }   
            },
            offset: 300
        })
    },

    renderChart: function(dataset) {
        var t = this;
        var config = t.config;

        //scale to use 1 to 100 values
        var scaleTo100 = d3.scale.linear().domain([0, 100]).range([0, 2 * config.PI]); 
        //color scale
        var colorScale = d3.scale.linear().domain([0, 100]).range([d3.rgb(config.colorFrom), d3.rgb(config.colorTo)]);

        var svg = d3.select('svg'); 

        //arc accessor
        var drawArc = d3.svg.arc()
            .innerRadius(function(d, i) {
                return  config.arcMin + i*(config.arcWidth) + config.arcPad;
            })
            .outerRadius(function(d, i) {
                return config.arcMin + (i+1)*(config.arcWidth);
            })
            .startAngle(0)
            .endAngle(function(d){ return scaleTo100(d.value)});
        
        // bind the data
        var skillArcs = svg.selectAll('path.skill-arc').data(dataset);
      

        // update arcs using attrTween and a custom tween function arc2Tween
        skillArcs.transition()
            .duration(config.transitionDuration)
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
            .attr('transform', config.translate)
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
                
                //d.value = interp(t) // this will overwrite the original object
                //TODO merge value with original object into a new one insted of the following
                var obj = {
                    skill: d.skill,
                    value : interp(t)
                }

                // pass this new information to the accessor
                // function to calculate the path points.

                // n.b. we need to manually pass along the
                //  index to drawArc so since the calculation of
                //  the radii depend on knowing the index.
                return drawArc(obj, indx);
            }
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
                .transition().duration(config.transitionDuration/2)
                .style('opacity', 0)
                .transition().duration(config.transitionDuration/2)
                .style('opacity', 1)
                .text(function(d) { return d.skill; })
        }


    },

    startChart: function(dataset) {
        var t = this;
        var config = t.config;

        // append svg to the DIV
        d3.select('.chart-container').append('svg:svg')
            .attr('width', config.width)
            .attr('height', config.height);
        
        //render the chart
        //render(data[currentData].data);
        t.renderChart(dataset[0].data);

        // making the click circle if not exists
        if(!d3.selectAll("circle.click-circle")[0].length) {

            // making the click circle for red arcs
            d3.select('svg').append('circle')
                .attr('class', 'click-circle')
                .attr('transform', config.translate)
                .attr('r', config.arcMin*0.85)
                .attr('fill', config.buttonColor)
                .on('click', function() {
                    toggleData();
                    toggleButton();
                    t.renderChart(t.data[t.currentData].data);
                })
                .on('mouseover', function() {
                    d3.select(this).classed('highlighted', true);
                })
                .on('mouseout', function() {
                    d3.select(this).classed('highlighted', false);
                });

            // add the label to the button
            d3.select('svg').append('text')
                .text(t.data[t.currentData].set)
                .attr('class', 'skills-button-text')
                .attr('x', getButtonTextPosition)
                .attr('y', config.height/2 + 5)
                .on("click", function() {
                    toggleData();
                    toggleButton();
                    t.renderChart(t.data[t.currentData].data);
                }).on('mouseover', function() {
                    d3.select('circle.click-circle').classed('highlighted', true);
                })
                .on('mouseout', function() {
                    d3.select('circle.click-circle').classed('highlighted', false);
                });
        }

        // toggle dataset 
        function toggleData(){
            if(t.currentData == t.data.length-1) {
                t.currentData = 0;
            } else {
                t.currentData++;
            }
        }

        // toggle button text 
        function toggleButton(){
            d3.select('svg').select('text.skills-button-text')
                .transition().duration(config.transitionDuration/2)
                .style('opacity', 0)
                .each('end', changeText) // changes the text when the opacity is 0 
                .transition().duration(config.transitionDuration/2)
                .style('opacity', 1);

            function changeText(){
                d3.select('svg').select('text.skills-button-text')
                  .text(t.data[t.currentData].set)    
                  .attr('x', getButtonTextPosition);
            }        
        }

        // calculates and returns the button's label position to be centered
        function getButtonTextPosition(){
            var circleWidth = config.arcMin*0.85 * 2
            var bbox = this.getBBox();
            var textwidth = bbox.width;
            var dif = circleWidth - textwidth;
            var offset = dif/2;
            var position = (config.width/2 - config.arcMin*0.85) + offset;
            return position;
        }
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

portfolio.Contact = $.extend(true, {}, portfolio.Section, {
    init: function() {
        //do things for section
        $('textarea').blur(function () {
            $('textarea').each(function () {
                $this = $(this);
                if ( this.value != '' ) {
                  $this.addClass('focused');
                  $('textarea + label + span').css({'opacity': 1});
                }
                else {
                  $this.removeClass('focused');
                  $('textarea + label + span').css({'opacity': 0});
                }
            });
        });

$('.field:first-child input').blur(function () {
    $('.field:first-child input').each(function () {
        $this = $(this);
        if ( this.value != '' ) {
          $this.addClass('focused');
          $('.field:first-child input + label + span').css({'opacity': 1});
        }
        else {
          $this.removeClass('focused');
          $('.field:first-child input + label + span').css({'opacity': 0});
        }
    });
});

$('.field:nth-child(2) input').blur(function () {
    $('.field:nth-child(2) input').each(function () {
        $this = $(this);
        if ( this.value != '' ) {
          $this.addClass('focused');
          $('.field:nth-child(2) input + label + span').css({'opacity': 1});
        }
        else {
          $this.removeClass('focused');
          $('.field:nth-child(2) input + label + span').css({'opacity': 0});
        }
    });
});
    }
});

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
        portfolio.Home.init();
        portfolio.Skills.init();
        portfolio.Contact.init();

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

