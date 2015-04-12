$(document).ready(function(){
	var groups = {
	"1" : ["Saturn", "Mercury", "Jupiter", "Uranus"],
	"2" : ["France", "England", "Spain", "Germany"],
	"3" : ["North", "South", "East", "West"],
	"4" : ["Pecan", "Walnut", "Pistachio", "Almond"],
	"5" : ["Robin", "Sparrow", "Nightingale", "Pigeon"],
	"6" : ["William Shakespeare", "Robert Frost", "Edgar Allen Poe", "Walt Whitman"],
	"7" : ["R&B", "Rap", "Country", "Jazz"],
	"8" : ["Red", "Blue", "Green", "Yellow"],
	"9" : ["Steak", "Ribs", "Burger", "Beef"],
	"10" : ["Carrot", "Cucumber", "Lettuce", "Tomato"],
	"11" : ["Carbon", "Nitrogen", "Hydrogen", "Oxygen"],
	"12" : ["Violin", "Trumpet", "Clarinet", "Piano"],
	"13" : ["Salsa", "Tango", "Foxtrot", "Waltz"],
	"14" : ["Zebra", "Elephant", "Giraffe", "Hippopotamus"],
	"15" : ["Hypotenuse", "Cosine", "Sine", "Tangent"],
	"16" : ["Libra", "Pisces", "Gemini", "Aquarius"],
	"17" : ["George Washington", "Benjamin Franklin", "John Adams", "James Madison"],
	"18" : ["Apple", "Banana", "Pear", "Grape"],
	"19" : ["Car", "Train", "Airplane", "Boat"],
	"20" : ["Documentary", "Romance", "Comedy", "Drama"],
	"21" : ["Cookies", "Brownies", "Cake", "Pie"],
	"22" : ["Penny", "Nickel", "Dime", "Quarter"],
	"23" : ["Massachusetts", "Texas", "Florida", "California"],
	"24" : ["Tennis", "Football", "Soccer", "Hockey"],
	"25" : ["Queen", "King", "Prince", "Princess"],
	"26" : ["Clubs", "Hearts", "Spades", "Diamonds"],
	"27" : ["Thyme", "Cumin", "Paprika", "Basil"],
	"28" : ["Antarctica", "Asia", "Africa", "Australia"],
	"29" : ["Latte", "Cappuccino", "Frappe", "Mocha"],
	"30" : ["Spring", "Autumn", "Winter", "Summer"],
	"31" : ["January", "April", "July", "October"],
	"32" : ["Breakfast", "Brunch", "Lunch", "Dinner"],
	"33" : ["Monday", "Wednesday", "Friday", "Saturday"],
	"34" : ["Harvard", "Yale", "Stanford", "Princeton"],
	"35" : ["Christmas", "Thanksgiving", "Easter", "Valentine's Day"],
	"36" : ["Rose", "Daffodil", "Daisy", "Lily"]
	}; 

	//This script extracts parameters from the URL
	//from jumbotronquery-howto.blogspot.com
	//from index.html of PS2 & PS3

    $.extend({
        getUrlVars : function() {
            var vars = [], hash;
            var hashes = window.location.href.slice(
                    window.location.href.indexOf('?') + 1).split('&');
            for ( var i = 0; i < hashes.length; i++) {
                hash = hashes[i].split('=');
                vars.push(hash[0]);
                vars[hash[0]] = hash[1];
            }
            return vars;
        },
        getUrlVar : function(name) {
            return $.getUrlVars()[name];
        }
    });



    /**
    	@returns a random integer between 
    	@param low and 
    	@param high, inclusive
    */
    var getRandomInteger = function(low, high){
    	return Math.floor(Math.random()*(high-low+1))+low;
    };

    /**
    	@returns an int array of the locations for all trials
    	@param num is how many locations are needed
    	@param options is the maximum index of the menu (should be 16)
    */
    var generateSequence = function(num, options){
    	locations = [];
    	for(var i = 0; i < num; i++){
    		locations[i] = getRandomInteger(1, options);
    	}
    	return locations;
    };

    /**
    	@returns a number in the range
    	@@param low to 
    	@param high inclusive that isn't already in
    	@param trash
    */
    var pickOther = function(low, high, trash){
    	while(true){
    		i = getRandomInteger(low, high);
    		if(trash.indexOf(i)<0){
    			break;
    		}
    	}
    	return i;
    };

    /**
    	@returns a boolean array of whether the trial prediction should be accurate or not
    	@param num is how many locations are needed
    	@param successRate is the number of trials that need to be successful
    */
    var createAccuracy = function(num, successRate){
    	bad = 0;
    	good = 0;
    	successes = [];
    	for (var i = 0; i < num; i++){
    		if(good >= successRate*num){
    			successes[i] = false;
    		}
    		else if(bad >= (1-successRate)*num){
    			successes[i] = true;
    		}
    		else{
    			s = Math.random() <= successRate;
    			successes[i] = s;
    			if(s){
    				good += 1;
    			}
    			else{
    				bad += 1;
    			}
    		}
    	}
    	return successes;
    };

    /**
    	Randomly picks a new state, and ensures control and ephemeral have equal numbers at the end.
    	@returns "ephemeral" or "control"
    */

    var newState = function(){
    	if(controlDone == numTrials){
    		return "ephemeral";
    	}
    	else if(epheDone == numTrials){
    		return "control";
    	}
    	else if(Math.random()>0.5){
    		return "ephemeral";
    	}
    	else{
    		return "control";
    	}
    };


    if($.getUrlVar('trials') && $.getUrlVar('trials')>0){
	    var numTrials = $.getUrlVar('trials'); //user will actually do twice this: one for each condition
    }
    else{
    	var numTrials = 10;
    }

    if($.getUrlVar('accuracy') && $.getUrlVar('accuracy')>=1){
    	var baseAccuracy = $.getUrlVar('accuracy');
    }
    else{
    	var baseAccuracy = 0.79;
    }

    var numGroups = 4;
    var numMenus = 3;

    var locations = generateSequence(numTrials, 4*numGroups);
    var accuracies = createAccuracy(numTrials, baseAccuracy); //high accuracy from paper

    var state = "start"; //give the user chances to see each type of menu. "start" means just started. "trial" means should demonstrate special menu. 
    //"ephemeral" means real trial on ephemeral menus. "control" means real trial on control menu
    var controlDone = 0; //number of controlled conditions completed
    var epheDone = 0; //number of ephemeral conditions completed
    var data = "trial,time,condition,position,accuracy\n"; //string for easy csv exporting
    var dataSubj = "difficulty,efficiency,satisfaction,frustration\n";

    var theWord;
    var wordIndex;

    var startTime;
    var endTime;
    var accurateNow;

    var bindStart = function(){

	$('#startButton').click(function(){

		//first build the menus
		used = [];
		for(var i = 1; i <= numMenus; i++){
			for(var j = 1; j <= numGroups; j++){
				k = pickOther(1, 36, used);
				words = groups[k];
				for(var l = 1; l <= 4; l++){
					$("#"+String(i)+"-"+String(4*(j-1)+l)).text(" " + words[l-1]);
				}
				used.push(k);
			}
		}


		//then select the word
		theMenu = getRandomInteger(1, numMenus);

		if(state == "start" || state == "trial"){
			//can just be random, since it's a trial run
			wordIndex =  getRandomInteger(1, 4*numGroups);
		}
		else if(state == "ephemeral"){
			wordIndex = locations[epheDone];
		}
		else if(state == "control"){
			wordIndex = locations[controlDone];
		}
		theWord = $("#"+String(theMenu)+"-"+String(wordIndex)).text();


		//set the menu behavior, if necessary
		if(state == "trial" || (state == "ephemeral" && accuracies[epheDone])){
			//this should be accurate
			accurateNow = 'true';
			for(var i = 1; i <= numMenus; i++){
				//choose the ones that stay
				if(i == theMenu){
					good = [wordIndex];
					good.push(pickOther(1, 16, good));
					good.push(pickOther(1, 16, good));
				}
				else{
					good = [];
					good.push(pickOther(1, 16, good));
					good.push(pickOther(1, 16, good));
					good.push(pickOther(1, 16, good));					
				}

				//set the css
				for(var j = 1; j <= 4*numGroups; j++){
					if(good.indexOf(j)>=0){
						$("#"+String(i)+"-"+String(j)).css("visibility", "visible");
					}
					else{
						$("#"+String(i)+"-"+String(j)).css("visibility", "hidden");
						className = "plsFade" + String(i);
						$("#"+String(i)+"-"+String(j)).addClass(className);
					}
				}
			}
		}
		else if(state == "ephemeral"){
			accurateNow = 'false';
			//this shouldn't be accurate
			for(var i = 1; i <= numMenus; i++){
				//choose the ones that stay
				good = [];
				good.push(pickOther(1, 16, good));
				good.push(pickOther(1, 16, good));
				good.push(pickOther(1, 16, good));					

				//set the css
				for(var j = 1; j <= 4*numGroups; j++){
					if(good.indexOf(j)>=0){
						$("#"+String(i)+"-"+String(j)).css("visibility", "visible");
					}
					else{
						$("#"+String(i)+"-"+String(j)).css("visibility", "hidden");						
						className = "plsFade" + String(i);
						$("#"+String(i)+"-"+String(j)).addClass(className);
					}
				}
			}
		}
		else{
			accurateNow = 'n/a';
			for(var i = 1; i <= numMenus; i++){
				for(var j = 1; j <= 4*numGroups; j++){
					$("#"+String(i)+"-"+String(j)).css("visibility", "visible");
				}
			}
		}

		//then set the word on the Jumbotron
		$('.jumbotron').empty();
		$('.jumbotron').append("<h2>"+theWord+"</h2>"+"<h3>Menu "+String(theMenu)+"</h3>");

		//finally, start a timer
		startTime = Date.now();

	}); //start button
	}; //bind start wrapper

	bindStart();

	$(".dropdown-menu li").click(function(e){
		if($("#"+String(e.target.id)).text() == theWord){
			if(state == "ephemeral" || state == "control"){
				endTime = Date.now();
				if(state == "ephemeral"){
					epheDone += 1;
				}
				else if(state == "control"){
					controlDone += 1;
				}
				data += String(epheDone+controlDone) +","+ String(endTime-startTime) +","+ state +","+ String(wordIndex)+","+accurateNow+"\n";

				$('.jumbotron').empty();

				if(epheDone == numTrials && controlDone == numTrials){
					$('nav').fadeOut();
					$('.jumbotron').append('<h1>Done with trials</h1><h3>Please fill out this short survey</h3>'+
						'<table class = "table table-hover table-condensed">'+
	  					'<thead><tr>'+
	  					'<td>Question</td><td>Strongly Disagree</td><td>Disagree</td><td>Slightly Disagree</td>'+
	  					'<td>Neutral</td><td>Slightly Agree</td><td>Agree</td><td>Strongly Agree</td>'+
	  					'</tr></thead><tbody>'+
	  					'<tr>'+
			  			'<td>The ephemeral (fading) menu was more <em>difficult</em> to use than the normal menu.</td>'+
			  			'<td><input type = "radio" value = "1" name = "difficulty"/></td>'+
			  			'<td><input type = "radio" value = "2" name = "difficulty"/></td>'+
			  			'<td><input type = "radio" value = "3" name = "difficulty"/></td>'+
			  			'<td><input type = "radio" value = "4" name = "difficulty"/></td>'+
			  			'<td><input type = "radio" value = "5" name = "difficulty"/></td>'+
			  			'<td><input type = "radio" value = "6" name = "difficulty"/></td>'+
			  			'<td><input type = "radio" value = "7" name = "difficulty"/></td>'+
	  					'</tr>'+
	  					'<tr>'+
			  			'<td>The ephemeral (fading) menu was more <em>efficient</em> to use than the normal menu.</td>'+
			  			'<td><input type = "radio" value = "1" name = "efficiency"/></td>'+
			  			'<td><input type = "radio" value = "2" name = "efficiency"/></td>'+
			  			'<td><input type = "radio" value = "3" name = "efficiency"/></td>'+
			  			'<td><input type = "radio" value = "4" name = "efficiency"/></td>'+
			  			'<td><input type = "radio" value = "5" name = "efficiency"/></td>'+
			  			'<td><input type = "radio" value = "6" name = "efficiency"/></td>'+
			  			'<td><input type = "radio" value = "7" name = "efficiency"/></td>'+
	  					'</tr>'+
	  					'<tr>'+
			  			'<td>The ephemeral (fading) menu was more <em>satisfying</em> to use than the normal menu.</td>'+
			  			'<td><input type = "radio" value = "1" name = "satisfaction"/></td>'+
			  			'<td><input type = "radio" value = "2" name = "satisfaction"/></td>'+
			  			'<td><input type = "radio" value = "3" name = "satisfaction"/></td>'+
			  			'<td><input type = "radio" value = "4" name = "satisfaction"/></td>'+
			  			'<td><input type = "radio" value = "5" name = "satisfaction"/></td>'+
			  			'<td><input type = "radio" value = "6" name = "satisfaction"/></td>'+
			  			'<td><input type = "radio" value = "7" name = "satisfaction"/></td>'+
	  					'</tr>'+
	  					'<tr>'+
			  			'<td>The ephemeral (fading) menu was more <em>frustrating</em> to use than the normal menu.</td>'+
			  			'<td><input type = "radio" value = "1" name = "frustration"/></td>'+
			  			'<td><input type = "radio" value = "2" name = "frustration"/></td>'+
			  			'<td><input type = "radio" value = "3" name = "frustration"/></td>'+
			  			'<td><input type = "radio" value = "4" name = "frustration"/></td>'+
			  			'<td><input type = "radio" value = "5" name = "frustration"/></td>'+
			  			'<td><input type = "radio" value = "6" name = "frustration"/></td>'+
			  			'<td><input type = "radio" value = "7" name = "frustration"/></td>'+
	  					'</tr>'+	  			  		
	  					'</tbody></table>'+
						'<p><button class="btn btn-primary btn-lg" id = "submitButton">Submit</button></p>');   
					state = "done";
					$('#submitButton').click(function(){
						dataSubj += $('input:radio[name=difficulty]:checked').val() + "," + 
							$('input:radio[name=efficiency]:checked').val() + "," +
							$('input:radio[name=satisfaction]:checked').val() + "," +
							$('input:radio[name=frustration]:checked').val() + "\n";

						$('.jumbotron').empty();
						$('.jumbotron').append('<h1>Thanks for participating!</h1><h3>Response Recorded.</h3><small><a id="csvLink">data file</a><br><a id="csvSubj">survey file</a></small>');
						var encodedUri = encodeURI("data:text/csv;charset=utf-8,"+data); 
						$("#csvLink").attr("href", encodedUri);
						$("#csvLink").attr("download", "my_data.csv");
						var encodedSurvey = encodeURI("data:text/csv;charset=utf-8,"+dataSubj);
						$("#csvSubj").attr("href",encodedSurvey);
						$("#csvSubj").attr("download", "my_survey.csv");
					}); //submit				
				}
				else{
					state = newState();
					$('.jumbotron').append('<p>Good job!</p><p>Click the button for the next word.</p><p><button class="btn btn-primary btn-lg" id = "startButton">Next</button></p>');			
					bindStart();
				}
			}
			else if(state == "start"){
				$('.jumbotron').empty();
				$('.jumbotron').append('<p>Great!</p><p>Some menus are special. They will <em>try</em> to guess the word for you.</p><p><button class="btn btn-primary btn-lg" id = "startButton">Try it</button></p>');
				state = "trial";
				bindStart();				
			}
			else if(state == "trial"){
				state = newState();
				$('.jumbotron').empty();
				$('.jumbotron').append('<p>Good job!</p><p>Now on to real trials.</p><p><button class="btn btn-primary btn-lg" id = "startButton">Start</button></p>');			
				bindStart();
			}

			//clean up
			for(var i = 1; i <= numMenus; i++){
				className = "plsFade" + i;
				$(".plsFade"+i).removeClass(className);				
			}
		}

	}); //dropdown-menu li

	$('.dropdown-toggle').click(function(e){
		if(state == "ephemeral" || state == "trial"){
			$(".plsFade"+e.target.id[0]).css("visibility","visible").hide().fadeIn(500);
			className = "plsFade" + e.target.id[0];
			$(".plsFade"+e.target.id[0]).removeClass(className);

		}
	}); //dropdown-toggle


}); //document.ready
