$(function(){
 
    $("#map").load('Israel_Map.svg',function(response){
 
        $(this).addClass("svgLoaded");
         
        if(!response){
            // Error loading SVG!
            // Make absolutely sure you are running this on a web server or localhost!
        }
 
    });

    /*$('#map').bind('click', function() {
		  console.log($('#map > svg > g'));
		});
	$('#map > svg > g').bind('click',function(){
		console.log("Entered");
	});*/

	$( "g").bind('click',function(){
		console.log("entered");
	});
});