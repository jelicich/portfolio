

var common = {
   
    init : function() 
    {	
        common.scrollTo();
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
    }
}
{
    $(window).on('load',function() {
        common.init();
    });
}

