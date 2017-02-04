var portfolio = {}

portfolio.Section = {
    SHOWN: false,
    init: function() {
    },

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
    });
}

