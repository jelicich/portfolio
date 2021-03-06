/**
 * Web dev portfolio
 * 
 * @author Esteban Jelicich - Julian Peña
 */

var portfolio = {};


/**
 * Section Base 
 */

portfolio.Section = {
    shown: false,
    sectionId: null, //html element id

    init: function() {},
    
    setShown: function(shown) {
        this.shown = shown;
    },

    isShown: function() {
        return this.shown;
    },

    onShow: function(callbacks, offset) {
        offset = offset || 300;
        var t = this;
        var waypoint = new Waypoint({
            element: document.getElementById(t.sectionId),
            handler: function() {
                var classObj = t.getClass();
                if(!classObj.isShown()) {
                    for(var i = 0; i < callbacks.length; i++) {
                        callbacks[i].apply(classObj);    
                    }
                    classObj.setShown(true);
                }
            },
            offset: offset
        });
    },

    getClass: function() {
        for(var classObj in portfolio) { 
            if(portfolio[classObj].sectionId == this.sectionId) {
                return portfolio[classObj];
            }
        }
    },

    sendStatistics: function() {
        var monitoringService = portfolio.service.MonitoringService;
        monitoringService.notify({
          category : monitoringService.eventCategory.section, 
          action : monitoringService.action.sectionLoaded,
          label : this.sectionId
        });
    },

    effects: function() {},
}


/**
 * Section Home
 */

portfolio.Home = $.extend(true, {}, portfolio.Section, {
    sectionId: 'home',

    init: function() {
        //do things for section
        $('#home h1').css({opacity: '1', animation: 'bounce-from-top 0.5s ease-out'});
        $('#home p').css({opacity: '1', animation: 'bounce-from-bottom 0.5s ease-out'});

        this.sendStatistics();
    }
});


/**
 * Section About
 */

portfolio.About = $.extend(true, {}, portfolio.Section, {
    sectionId: 'about',

    init: function() {      
        this.onShow([this.effects, this.sendStatistics], 300);

        //bind event stats
        var $btnCv = $('#download-cv-btn');
        $btnCv.click(function() {
            var monitoringService = portfolio.service.MonitoringService;
            monitoringService.notify({
                category : monitoringService.eventCategory.about, 
                action : monitoringService.action.downloadedCv
            });
        });

    },

    effects: function() {
        $('#about .img-about').css({opacity: '1', animation: 'bounce-from-right 0.5s ease-out'});
        $('#about .text-wrapper').css({opacity: '1'});
    },

    sendStatistics: function() {
        var monitoringService = portfolio.service.MonitoringService;
        monitoringService.notify({
          category : monitoringService.eventCategory.section, 
          action : monitoringService.action.sectionLoaded,
          label : this.sectionId
        });
    }

});


/**
 * Section Skills
 */

portfolio.Skills = $.extend(true, {}, portfolio.Section, {
    sectionId: 'skills',
    currentData: 0,

    //Data to be displayed. Edit as desired
    data : [{
        set: 'Front-end',
        data: [{
            skill: 'Task Runners',
            value: 40
        },{
            skill: 'CSS',
            value: 85
        },{
            skill: 'HTML',
            value: 90
        },{
            skill: 'Javascript',
            value: 75
        },]
    },
    {
        set: 'Back-end',
            data: [{
            skill: 'Linux',
            value: 30
        },{
            skill: 'Apache',
            value: 30
        },{
            skill: 'MySQL',
            value: 40
        },{
            skill: 'PHP',
            value: 45
        }]
    },
    {
        set: 'Misc',
            data: [{
            skill: 'Coffee',
            value: 75
        },{
            skill: 'Mate',
            value: 15
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
        textDown: 18,
        transitionDuration: 500,
        colorFrom: '#dadada',
        colorTo: '#3e3e3e',
        buttonColor: '#FF5252',//'rgba(201, 201, 201, 0.5)', //if changed, update fill value of .click-circle.highlighted in skills.scss. also this can be set in scss

        //chart will be placed in the middle of the svg
        translate: 'translate(' + $('.chart-container').width()/2 + ', ' + $('.chart-container').height()/2 + ')'
    },

    init: function() {
        var t = this;
        var initData = [{set: '',data: [{skill: '',value: 0},{skill: '',value: 0},{skill: '',value: 0},{skill: '',value: 0}]}];

        //reset config for mobile:
        if($('.chart-container').width() < 414) {
            t.config.arcMin = 50;
            t.config.arcWidth = 20;
            t.config.textDown = 14;
        }
        //Note: this code will expect the same length on every dataset.
        //starts with empty data to animate from 0 with effects function
        this.startChart(initData);

        t.onShow([t.effects, t.sendStatistics], 300);
        
        var $btnSkillsText = $('text.skills-button-text');
        var $btnSkillsCircle = $('circle.click-circle');
        $([$btnSkillsCircle, $btnSkillsText]).each(function(){
            $(this).click(function() {
                var monitoringService = portfolio.service.MonitoringService;
                monitoringService.notify({
                    category : monitoringService.eventCategory.skills, 
                    action : monitoringService.action.switchedSkills
                });
            });
        });

    },

    effects: function() {
        // update the chart with the proper data
        this.renderChart(this.data[this.currentData].data)

        var $section = $('#skills');
        $section.css('opacity', 1);
    },

    renderChart: function(dataset) {
        var t = this;
        var config = t.config;

        //scale to use 1 to 100 values
        var scaleTo100 = d3.scale.linear().domain([0, 100]).range([0, 2 * config.PI]); 
        //color scale
        var colorScale = d3.scale.linear().domain([0, 100]).range([d3.rgb(config.colorFrom), d3.rgb(config.colorTo)]);

        var svg = d3.select('svg#chart-svg'); 

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
                .attr('dy', config.textDown) //Move the text down
                .append('textPath')
                .attr('class', 'skill-label-path')
                .attr('xlink:href',function(d,i){return '#skill-arc-'+i;})
                .text(function(d){ return d.skill ; });
        };

        function updateText() {
            var paths = svg.selectAll('textPath.skill-label-path');
            paths.data(dataset)
                .transition().duration(config.transitionDuration/2)
                .style('opacity', 0)
                .transition().duration(config.transitionDuration/2)
                .style('opacity', 1)
                .text(function(d) { return d.skill + ' : ' + d.value + '%'; })
        }


    },

    startChart: function(dataset) {
        var t = this;
        var config = t.config;

        // append svg to the DIV
        d3.select('.chart-container').append('svg:svg')
            .attr('width', config.width)
            .attr('height', config.height)
            .attr('id','chart-svg');
        
        //render the chart
        //render(data[currentData].data);
        t.renderChart(dataset[0].data);

        // making the click circle if not exists
        if(!d3.selectAll("circle.click-circle")[0].length) {

            // making the click circle for red arcs
            d3.select('svg#chart-svg').append('circle')
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
            d3.select('svg#chart-svg').append('text')
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
            d3.select('svg#chart-svg').select('text.skills-button-text')
                .transition().duration(config.transitionDuration/2)
                .style('opacity', 0)
                .each('end', changeText) // changes the text when the opacity is 0 
                .transition().duration(config.transitionDuration/2)
                .style('opacity', 1);

            function changeText(){
                d3.select('svg#chart-svg').select('text.skills-button-text')
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


/**
 * Section Contact
 */

portfolio.Contact = $.extend(true, {}, portfolio.Section, {
    sectionId: 'contact',
    timeOutModal: null,
    counterInterval: null,

    init: function() {
        var t = this;
        t.onShow([t.effects, t.sendStatistics], 100);

        $('#modal-contact').on('hidden.bs.modal', function() {
            clearTimeout(portfolio.Contact.timeOutModal);
            clearInterval(portfolio.Contact.counterInterval);
            $('.auto-close-notice').hide();
        });

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
                  if(portfolio.Common.validateEmail(this.value)) {
                    $('.field:nth-child(2) input + label + span + span.err').css({'opacity': 0});
                    $('.field:nth-child(2) input + label + span.ok').css({'opacity': 1});  
                  } else {
                    $('.field:nth-child(2) input + label + span.ok').css({'opacity': 0}); 
                    $('.field:nth-child(2) input + label + span + span.err').css({'opacity': 1});
                  }
                  
                }
                else {
                  $this.removeClass('focused');
                  $('.field:nth-child(2) input + label + span').css({'opacity': 0});
                  $('.field:nth-child(2) input + label + span + span').css({'opacity': 0});
                }
            });
        });

        var $submit = $('#submit-form');
        $submit.click(function(e) {
            e.preventDefault();
            t.sendMessage();
        });
            
    },

    effects: function() {
        var $title = $('#contact h1');
        $title.css('opacity', 1);

        var $form = $('#contact form');
        $form.css({opacity: '1', animation: 'bounce-from-bottom 0.5s ease-out'});
    },

    sendMessage: function() {
        var t = this;
        var data = {
            name: $('#name').val(),
            email: $('#email').val(),
            message: $('#msg').val()
        };
        var $result = $('#contact-result');
        var $modal = $('#modal-contact');
        $modal.modal({ show: false})

        $.ajax({
            method: 'POST',
            url: './ajax/contact-form.php',
            data: data,
            dataType: 'json',
            success: function(data, status, jqXHR) {
                $result.html(data.msg);
                if(data.status == 'ok') {
                    $('#name').val('');
                    $('#name').blur();
                    $('#email').val('');
                    $('#email').blur();
                    $('#msg').val('');
                    $('#msg').blur();
                    t.delayedModalClose($modal, 8000);

                    var monitoringService = portfolio.service.MonitoringService;
                    monitoringService.notify({
                        category : monitoringService.eventCategory.contact, 
                        action : monitoringService.action.sentMessage
                    });
                }
                $modal.modal('show');
            },
            error: function(jqXHR, textStatus, errorThrown) {
                $result.html(errorThrown);
                $modal.modal('show');
                t.delayedModalClose($modal, 10000);
            },
            complete: function() {
                //t.delayedModalClose($modal, 10000);
            },
            beforeSend: function() {
                $result.html('<p>Sending message...</p><p class="align-center"><img src="assets/img/loading.gif" alt="Loading"/></p>');
                $modal.modal('show');
            }
        })
    },

    delayedModalClose: function($modal, time){
        $('.auto-close-notice').show();
        var counter = time/1000;
        $('#auto-close-counter').html(counter);

        portfolio.Contact.counterInterval = setInterval(function() {
            counter--;
            $('#auto-close-counter').html(counter)
        }, 1000);

        portfolio.Contact.timeOutModal = setTimeout(function() {
            $modal.modal('hide');    
        }, time);
    }
});


/**
 * Section Works 
 */

portfolio.Works = $.extend(true, {}, portfolio.Section, {
    sectionId: 'works',

    init: function() {
        var t = this;
        t.onShow([t.effects, t.sendStatistics], 100)
        t.showcase();

        var $workCard = $('#works .card');
        $workCard.click(function(){
            var content = $(this).data('content');
            t.loadContent.apply(t,[content]);

            var monitoringService = portfolio.service.MonitoringService;
            monitoringService.notify({
                category : monitoringService.eventCategory.works, 
                action : monitoringService.action.launchedWork,
                label : $(this).find('.course-title').html()
            });
        });

    },

    effects: function() {
       var $title = $('#works h1');
        $title.css('opacity', 1);

        var $slideBtn = $('#works .flickity-prev-next-button');
        $slideBtn.css('opacity', 0.8);

        var $slides = $('#works .course-item.slide');
        $slides.each(function(i,el){
            setTimeout(function(){
                $(el).css({opacity: '1', animation: 'bounce-from-top 0.5s ease-out'});       
            },i*100)
            
        });  
    },

    showcase: function() {
        $("#showcase-works").flickity({
            wrapAround: true,
            pageDots: false,
            initialIndex: 1
        });
    },

    loadContent: function(content) {
        var file = content+'.json';
        var $curtain = $('<div>').addClass('modal-loading');
        var $modal = $('#modal-works');
        $modal.attr('data-displaying', this.sectionId)
        $('.modal-content', $modal).append($curtain);

        var prevSrc = $('.work-img').attr('src');
        
        $.getJSON( './assets/json/' + file, function(data) {
            
            var items = [];
            //console.log(data.name);
            $('#modal-works-title').html(data.name);
            $('.work-description').html(data.description);
            $('.work-img').attr('src', data.img);
            $('.work-link').html(data.link);
            $('.work-link').attr('href', data.link);

            //clear techs
            $('.work-tech').html('');
            for(var i = 0; i < data.tech.length; i++) {
                var tech = data.tech[i];
                var $span = $('<span>').addClass('tech-icon').addClass(tech);
                $span.html(tech);
                $('.work-tech').append($span);
            }

            //remove the loader
            if(prevSrc == $('.work-img').attr('src')) {
                $curtain.remove();
            } else { 
                $('.work-img').on('load', function() {
                   $curtain.fadeOut('fast', function() {
                        $curtain.remove();
                    }); 
                })
            }
               
            //assign the proper google event to the link 
            var $workLink = $('.work-link');
            $workLink.click(function() {
                var monitoringService = portfolio.service.MonitoringService;
                var section = $('#modal-works').data('displaying');
                monitoringService.notify({
                    category : monitoringService.eventCategory[section], 
                    action : monitoringService.action.clickedOnModalLink,
                    label : $('#modal-works-title').html()
                });
            });
                
        });
    }
});


/**
 * Section Lab
 */

//extends from works
portfolio.Lab = $.extend(true, {}, portfolio.Works, {
    sectionId: 'lab',

    init: function() {
        var t = this;
        t.onShow([t.effects, t.sendStatistics], 100);
        //t.showcase(); 

        var $labCard = $('#lab .card');
        $labCard.click(function(){
            var content = $(this).data('content');
            t.loadContent(content);

            var monitoringService = portfolio.service.MonitoringService;
            monitoringService.notify({
                category : monitoringService.eventCategory.lab, 
                action : monitoringService.action.launchedLab,
                label : $(this).find('.course-title').html()
            });
        });
    },

    effects: function() {
        var $title = $('#lab h1');
        $title.css('opacity', 1);

        var $slideBtn = $('#lab .flickity-prev-next-button');
        $slideBtn.css('opacity', 1);

        var $slides = $('#lab .course-item.slide');
        $slides.each(function(i,el){
            setTimeout(function(){
                $(el).css({opacity: '1', animation: 'bounce-from-top 0.5s ease-out'});       
            },i*100)
            
        }); 
    },

    showcase: function() {
        $("#showcase-lab").flickity({
            wrapAround: true,
            pageDots: false,
            initialIndex: 1
        });
    },
});


/**
 * Site Commons
 */

portfolio.Common = {
    wheelCount: 0,
    swipeCount: 0,
    isModalOpen: false,
    modalOpen: null,
    dotsInterval: null,

    init : function() 
    {   
        var t = this;
        var $modal = $('.modal');
        t.scrollTo();
        t.preload();


        if(t.isMobile()) {
            t.onMobileSwipe();
            //close navbar when clicking on a link
            t.setNavbarLinks();

            t.addMultipleEventListener(window, 'touchmove touchcancel', function(event) {
                if(!portfolio.Common.isModalOpen) { 
                    event.preventDefault();
                }
            })

            //scroll to contact after input blur 
            $('#contact input, #contact textarea').blur(function() {
                var top = $('#contact').offset().top;
                $('html, body').stop().animate({
                    scrollTop: top
                }, 200);
            });

            //mobile hack for bootstrap modal bug
            $modal.on('shown.bs.modal', function(e){
                portfolio.Common.fixBg();
            })
            $modal.on('hidden.bs.modal', function(e){
                portfolio.Common.releaseBg();
            })

        } else {
            t.onWheelMove();
        }

        $modal.on('shown.bs.modal', function(e){
            portfolio.Common.isModalOpen = true;
            portfolio.Common.modalOpen = this;

            portfolio.Common.safariFixBg();
        })

        $modal.on('hidden.bs.modal', function(e){
            portfolio.Common.isModalOpen = false;
            portfolio.Common.modalOpen = null;
            
            portfolio.Common.safariReleaseBg();
        })

        //init google analytics
        var googleHandler = portfolio.service.MonitoringHandler.Google;
        googleHandler.init();

        portfolio.service.MonitoringService.setServiceHandler(googleHandler);

        //set google analytics event for footer links:
        var $footerLinks = $('footer a');
        $footerLinks.each(function(){
            $(this).click(function(){
                var monitoringService = portfolio.service.MonitoringService;
                monitoringService.notify({
                    category : monitoringService.eventCategory.footer, 
                    action : monitoringService.action.clickedOnFooterLink,
                    label : $(this).attr('href')
                });
            });
                
        })
    },

    addMultipleEventListener: function(element, eventNames, listener) {
        var events = eventNames.split(' ');
        for (var i=0, iLen=events.length; i<iLen; i++) {
            element.addEventListener(events[i], listener, false);
        }
    },

    isMobile: function() {
        var check = false;
        (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
        return check;
    },

    isMobileAndTablet: function() {
        var check = false;
        (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
        return check;
    },

    isSafariMobile: function() {
        return !!navigator.userAgent.match(/Version\/[\d\.]+.*Safari/);
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

    setNavbarLinks: function() {
        $('.navbar-collapse a').click(function(){
            $('.navbar-collapse').collapse('hide');
        })
        $('.navbar-brand').click(function(){
            $('.navbar-collapse').collapse('hide');  
        })
    },

    onWheelMove: function() {
      var delay = false;
      
      $(document).on('mousewheel DOMMouseScroll', function(event) {
        if(portfolio.Common.isModalOpen) return;

        event.preventDefault();
        portfolio.Common.wheelCount++;
        
        //console.log(portfolio.Common.wheelCount);
        
        if(portfolio.Common.wheelCount >= 3) {
            if(delay) return;

            delay = true;
            setTimeout(function(){delay = false; portfolio.Common.wheelCount = 0;}, 500)

            var wd = event.originalEvent.wheelDelta || -event.originalEvent.detail;

            var a = document.querySelectorAll('section.portfolio-section');

            if(wd < 0) {
              for(var i = 0 ; i < a.length ; i++) {
                var t = a[i].getClientRects()[0].top;
                if(t >= 40) break;
              }
            }
            else {
              for(var i = a.length-1 ; i >= 0 ; i--) {
                var t = a[i].getClientRects()[0].top;
                if(t < -20) break;
              }
            }
            //debugger;
            var top = (a[i]) ? a[i].offsetTop : null;
            if(top != null) {
                $('html,body').animate({
                  scrollTop: top
                },1000);
            }
        }          
      });
    },

    onMobileSwipe: function() {
        var delay = false;
        $('body').swipe(function(direction, offset) {
            if(portfolio.Common.isModalOpen) {
                // var $modal = $(portfolio.Common.modalOpen).find('.modal-dialog');
                // $modal.css('transform','translate(0,' + (offset.y * -1) + 'px)');
                // console.log(offset.y)
                return;
            }

            portfolio.Common.swipeCount++;

            if(Math.abs(offset.y) > 20) {

                if(delay) return;
                delay = true;
                setTimeout(function(){delay = false; }, 250)

                var a = document.querySelectorAll('section.portfolio-section');
                
                //swipe up
                if(offset.y > 0) {
                  for(var i = 0 ; i < a.length ; i++) {
                    var t = a[i].getClientRects()[0].top;
                    if(t >= 40) break;
                  }
                }
                //swipe down
                else if(offset.y < 0) {
                  for(var i = a.length-1 ; i >= 0 ; i--) {
                    var t = a[i].getClientRects()[0].top;
                    if(t < -20) break;
                  }
                }

                //debugger;
                var top = (a[i]) ? a[i].offsetTop : null;
                if(top != null) {
                    $('html,body').animate({
                      scrollTop: top
                    },1000);
                }
            }
                
        });
    },

    preload: function() {
        var $dotsContainer = $('#loading-screen span');
        portfolio.Common.dotsInterval = setInterval(function(){
            if($dotsContainer.html() == '...') {
                $dotsContainer.html('')
            }else{
                var html = $dotsContainer.html();
                $dotsContainer.html(html + '.');    
            }
            
        }, 500);
    },

    removeLoader: function() {
        clearInterval(portfolio.Common.dotsInterval);
        var $curtain = $('#loading-screen');
        $curtain.fadeOut('fast', function() {
            $curtain.remove();
        });
    },

    //hack for ios to prevent scrolling body when modal is open,
    safariFixBg: function() {
        if(portfolio.Common.isSafariMobile()) {
            $('body').css('overflow','hidden');
            $('body').css('position','fixed');
        }
    },

    //hack for ios to prevent scrolling body when modal is open,
    safariReleaseBg: function() {
        if(portfolio.Common.isSafariMobile()) {
            $('body').css('overflow','');
            $('body').css('position','');
        }
    },

    validateEmail: function(email) {
        var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(email);
    }

}


/**
 * Services
 */

portfolio.service = {};

portfolio.service.MonitoringService = {

  service : null,
  enabled : true,
  
  eventCategory : {
    section : 'section',
    home    : 'home',
    about   : 'about',
    works   : 'works',
    lab     : 'lab',
    skills  : 'skills',
    contact : 'contact',
    footer  : 'footer'
  },

  action : {
    sectionLoaded       : 'Section Loaded',
    downloadedCv        : 'Downloaded CV',
    launchedWork        : 'Launched Work',
    launchedLab         : 'Launched Lab',
    clickedOnModalLink  : 'Clicked on modal link',
    switchedSkills      : 'Switched skills',
    sentMessage         : 'Sent Message',
    clickedOnFooterLink : 'Clicked on footer link'
  },

  setServiceHandler : function(serviceHandler) {
    this.service = serviceHandler;
  },

  enable : function() {
    this.enabled = true;
  },

  disable : function() {
    this.enabled = false;
  },

  isEnabled : function() {
    return this.enabled;
  },

  notify : function(options) {
    if (this.isEnabled() && this.service) {
      this.service.notify(options);
    }
  }
};

// Abstract
portfolio.service.MonitoringHandler = {
  init : function() {
    // initialization
  },

  notify : function(category, action, label, options) {
    // Notify 3rd party service or other
  }
}

//we can have different handlers in order to switch to other analytics provider
portfolio.service.MonitoringHandler.Google = $.extend(true, {}, portfolio.service.MonitoringHandler, {
  
  init : function() {
    
    //var trackingId = 'UA-92521692-1';
    var trackingId = '';

    //GA
    (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
    (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
    m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
    })(window,document,'script','//www.google-analytics.com/analytics.js','ga');

    ga('create', trackingId, 'auto');
    
    ga('send', 'pageview');
    
  },

  notify : function(options) {
    console.log('Notify google opts: ',options);
    ga('send', 'event', options.category, options.action, options.label, options.options);
  }
})


/*
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
*/
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
    $(document).ready(function(){
        portfolio.Common.init();
    });

    $(window).on('load',function() {
        portfolio.Common.removeLoader();
        portfolio.Home.init();
        portfolio.About.init();
        portfolio.Skills.init();
        portfolio.Works.init();
        portfolio.Lab.init();
        portfolio.Contact.init();

        // ( function( $ ) {
        //     Init Skrollr
        //     var s = skrollr.init({
        //         render: function(data) {
        //             //Debugging - Log the current scroll position.
        //             //console.log(data.curTop);
        //         },
        //     });
        // } )( jQuery );
    });
}

