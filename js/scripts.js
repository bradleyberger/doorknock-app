// tripple click
(function(){
    // Default options
    var defaults = {
        threshold: 1000, // ms
    }

    function tripleHandler(event)
    {
        var $elem = jQuery(this);

        // Merge the defaults and any user defined settings.
        settings = jQuery.extend({}, defaults, event.data);

        // Get current values, or 0 if they don't yet exist.
        var clicks = $elem.data("triclick_clicks") || 0;
        var start  = $elem.data("triclick_start")  || 0;

        // If first click, register start time.
        if (clicks === 0) { start = event.timeStamp; }

        // If we have a start time, check it's within limit
        if (start != 0
            && event.timeStamp > start + settings.threshold)
        {
            // Tri-click failed, took too long.
            clicks = 0;
            start  = event.timeStamp;
        }

        // Increment counter, and do finish action.
        clicks += 1;
        if (clicks === 3)
        {
            clicks     = 0;
            start      = 0;
            event.type = "tripleclick";

            // Let jQuery handle the triggering of "tripleclick" event handlers
            if (jQuery.event.handle === undefined) {
                jQuery.event.dispatch.apply(this, arguments);
            }
            else {
                // for jQuery before 1.9
                jQuery.event.handle.apply(this, arguments);
            }
        }

        // Update object data
        $elem.data("triclick_clicks", clicks);
        $elem.data("triclick_start",  start);
    }

    var tripleclick = $.event.special.tripleclick =
    {
        setup: function(data, namespaces)
        {
            $(this).bind("touchstart click.triple", data, tripleHandler);
        },
        teardown: function(namespaces)
        {
            $(this).unbind("touchstart click.triple", tripleHandler);
        }
    };
})();


// localStorage helper function - note the non-camel casing
var localstorage = {
    set: function (key, value) {
        window.localStorage.setItem( key, JSON.stringify(value) );
    },
    get: function (key) {
        try {
            return JSON.parse( window.localStorage.getItem(key) );
        } catch (e) {
            return null;
        }
    }
};


var displayExistingHomes = function(){
	var existingHousesList = localStorage.getItem("houses");
	existingHousesList = JSON.parse(existingHousesList);
	if (existingHousesList.length > 0) {
		var existingHousesHtml = '<h1>Existing Houses</h1><ul>';
		var existingHousesList = localStorage.getItem("houses");
		existingHousesList = JSON.parse(existingHousesList);
		for (i = 0; i < existingHousesList.length; i++){
			existingHousesHtml += '<li class="load-existing" data-id="'+i+'">' + existingHousesList[i] + '</li>';
		}
		existingHousesHtml += '</ul>'
		$('#existing-houses').html(existingHousesHtml);
	}
}


var setSettingsTitle = function(){
	var currentHouse = localstorage.get('houses');
	if (currentHouse.length > 0){
		var currentHouseIndex = parseInt(localStorage.getItem('currentIndex'));
		currentHouse = currentHouse[currentHouseIndex];
		$('#settings-menu h1').remove();
		$('#settings-menu').prepend('<h1>' + currentHouse + '</h1>');
	}
}

var totalTimeDiff = function(shouldStart){
	var originalTime = parseInt(localStorage.getItem(localStorage.getItem('currentIndex') + '-totaltime'));
	if (originalTime > 1400000000){ // rough lower limit of phesable epoch time
		var currentTime = Math.round(new Date().getTime() / 1000);
		var timeDiff = currentTime - originalTime;
		console.log(originalTime + ' - 1');
		return timeDiff;
	} else {
		var currentTime = Math.round(new Date().getTime() / 1000);
		var timeDiff = currentTime - originalTime;
		if (shouldStart == true) {
			localStorage.setItem(localStorage.getItem('currentIndex') + '-totaltime', timeDiff.toString());
		}
		console.log(originalTime + ' - 2');
		return originalTime;
	}
};

var stopTimer = function(){
	clearTimeout(repeatTotalTime);
	$('body').removeClass('running');
	$('#stop-session').find('.sub-text').fadeIn('fast');
	setTimeout(function(){
		$('#stop-session').find('.sub-text').fadeOut(1000);
	},2000)
	localStorage.setItem(localStorage.getItem('currentIndex') + '-totaltime', totalTimeDiff(false));
};

var mainSectionSetup = function(){
	// load previous values
	$('#doors .content').text(localStorage.getItem(localStorage.getItem('currentIndex') + '-doors'));
	$('#contacts .content').text(localStorage.getItem(localStorage.getItem('currentIndex') + '-contacts'));
	$('#totaltime').find('.content').text(totalTimeDiff(false));
	$('#house-counter').trigger('click');
}


var firstTime = function (){
	if (localStorage.getItem("currentIndex") === null) {
		localStorage.setItem('houses', JSON.stringify([]));
		$('#new-session-menu').show();
	};
};


var mainSectionListeners = function(){
	
	$('#house-counter > div').each(function(){
		var thisHeight = $(this).height();
		$(this).find('.content').css({
			'line-height':thisHeight + 'px'
		})
	});


	$('#doors').on('click',function(){
		if (!$('body').hasClass('locked')){
			var currentCount = parseInt(localStorage.getItem(localStorage.getItem('currentIndex') + '-doors'));
			currentCount++;
			$(this).find('.content').text(currentCount);
			localStorage.setItem(localStorage.getItem('currentIndex') + '-doors', currentCount.toString());
		}
	})

	$('#contacts').on('click',function(){
		if (!$('body').hasClass('locked')){
			var currentCount = parseInt(localStorage.getItem(localStorage.getItem('currentIndex') + '-contacts'));
			currentCount++;
			$(this).find('.content').text(currentCount);
			localStorage.setItem(localStorage.getItem('currentIndex') + '-contacts', currentCount.toString());
		}
	})

	var repeatHomeTime;
	var homeTime = function(elem){
		var currentCount = parseInt($(elem).find('.content').text())
		currentCount++
		$(elem).find('.content').text(currentCount)
		repeatHomeTime = setTimeout(function(){
			homeTime(elem);
		},1000)
	}
	$('#hometime').on('click',function(){
		if (!$('body').hasClass('locked')){
			clearTimeout(repeatHomeTime);
			$(this).find('.content').text('0');
			homeTime($(this));
		}
	})



	var repeatTotalTime;
	window.repeatTotalTime = repeatTotalTime;
	var totalTime = function(elem){
		/*var originalTime = parseInt(localStorage.getItem(localStorage.getItem('currentIndex') + '-totaltime'));
		var currentTime = Math.round(new Date().getTime() / 1000);
		var timeDiff = currentTime - originalTime;
		$(elem).find('.content').text(timeDiff);*/
		/*
		if (currentCount == 60){
			$('.totalsecs').text('0');
			var currentMins = parseInt($(elem).find('.totalmins').text())
			currentMins++;
			if (currentMins == 60){
				$('.totalmins').text('0');
				var currentHours = parseInt($(elem).find('.totalmins').text())
				currentHours++
				$('.totalhours').text(currentHours);
			} else {
				$(elem).find('.totalmins').text(currentMins)
			}
		} else {
			$(elem).find('.totalsecs').text(currentCount)
		}
		*/

		$(elem).find('.content').text(totalTimeDiff(true));
		window.repeatTotalTime = setTimeout(function(){
			totalTime(elem);
		},1000)
	}
	
	
	$('#house-counter').on('click',function(){
		if (!$('body').hasClass('running')){
			$('body').addClass('running');
			if (localStorage.getItem(localStorage.getItem('currentIndex') + '-totaltime') === null){
				localStorage.setItem(localStorage.getItem('currentIndex') + '-totaltime', Math.round(new Date().getTime() / 1000).toString());
			}
			//$('#totaltime').find('.content').html('<span class="totalhours">0</span> : <span class="totalmins">0</span> : <span class="totalsecs">0</span>');
			totalTime($('#totaltime'));
		}
	})



	$('#lock').bind('tripleclick',function(){
		$('body').toggleClass('locked');
		if ($('body').hasClass('locked')){
			$(this).find('.content').text('locked');
		} else {
			$(this).find('.content').text('unlocked');
		}
	});
	
	$('#settings').on('click',function(e){
		e.stopPropagation();
		$('#settings-menu').slideDown();

		stopTimer()
		/*setTimeout(function(){
			//TODO this isn't working at all!
			window.clearTimeout(repeatTotalTime);
			$('body').removeClass('running');
			$('#stop-session').find('.sub-text').fadeIn('fast');
			setTimeout(function(){
				$('#stop-session').find('.sub-text').fadeOut(1000);
			},2000)
			localStorage.setItem(localStorage.getItem('currentIndex') + '-totaltime', totalTimeDiff(false));
	
		},100);*/
	});
}


var newHomeSection = function(){
	
	displayExistingHomes();
	
	$('#new-home-submit').on('click',function(){
		if ( $('body').hasClass('running') ){
			localStorage.setItem(localStorage.getItem('currentIndex') + '-totaltime', totalTimeDiff(false));
		}
		$('#new-session-menu').slideUp();
		var houses = localstorage.get('houses');
		houses.push($('#new-home-value').val());
		localstorage.set('houses',houses);		
		localStorage.setItem('currentIndex', (houses.length - 1));
		localStorage.setItem(localStorage.getItem('currentIndex') + '-doors', '0');
		localStorage.setItem(localStorage.getItem('currentIndex') + '-contacts', '0');
		localStorage.setItem(localStorage.getItem('currentIndex') + '-totaltime', '0');
		mainSectionSetup();
		setSettingsTitle();
		displayExistingHomes();
	});
}

var statisticsSection = function(){
	$('#statistics').on('click',function(){
		$('#statistics').find('.sub-text').fadeIn('fast');
		setTimeout(function(){
			$('#statistics').find('.sub-text').fadeOut(1000);
		},2000)
	});
};

var settingsSection = function(){
	
	setSettingsTitle();
	
	$('#stop-session').on('click',function(){
		// stop the timer and save the total time as the localstorage value
		stopTimer();
	});

	$('#new-session').on('click',function(){
		$('#new-session-menu').slideDown();
		$('#settings-menu').slideUp();
	});
	
	$('#existing-houses').on('click','.load-existing',function(){
		stopTimer();
		existingSessionId = $(this).attr('data-id');
		localStorage.setItem('currentIndex', existingSessionId);
		mainSectionSetup();
		setSettingsTitle();
		$('#new-session-menu').slideUp();
	});
	
	$('.close-menu').on('click',function(){
		$(this).parent().slideUp();
	});
	
}

$(document).ready(function(){
	firstTime();
	mainSectionSetup();
	newHomeSection();
	settingsSection();
	mainSectionListeners();
	statisticsSection();
});