

var common = {
   
    init : function() 
    {	
        common.scrollTo();
        common.showcase();

    },

    scrollTo: function(){
    	$('a[href^="#"]').on('click', function(event) {
		    var target = $(this.getAttribute('href'));
		    if( target.length ) {
		        event.preventDefault();
		        $('html, body').stop().animate({
		            scrollTop: target.offset().top
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
{
    $(window).on('load',function() {
        common.init();
    });
}

