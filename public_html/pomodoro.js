var gAngle = 0;           // Value to add each time to rotate tomato
var gIncAngle = 0;        // Accumulated gAngle for absolute rotational position 
var gWorkSeconds = 0;     // Constant number of work seconds calculated from user set minutes
var gWorkCountDown = 0;   // Count down gWorkSeconds to timeout work phase
var gRestCountDown = 0;   // Count down gRestSeconds to timeout work phase
var gRestSeconds = 0;     // Constant number of rest seconds calculated from user set minutes
var gWorking = true;      // Set if in working phase and cleared for rest phase
var gFatTomato = false;   // Set if a fullsized image is to be displayed and clear if smaller image required
var gTimer = null;        // Holds the timer handle
var gRunning = false;     // Set if app is running in worl or rest mode
var gImage = null;        // Handle to image used by various functions
var gWorkEndSound = null; // Handle to sound file
var gRestEndSound = null; // Handle to sound file


/*********************************************************************************************************************/
// Document Ready
// Initialise app and globals.  Need JQuery handlers in here to get initialised
/*********************************************************************************************************************/
$(document).ready(function () {

  // Load sound resources once
  gWorkEndSound = new Audio("factorywhistle.mp3");
  gRestEndSound = new Audio("boxing-bell.mp3");

  initialise();

  /*******************************************************************************************************************/
  // Less work time button click
  // Decrement minutes.  1 is least.  Update new minutes value on page. Reset app as time has been changed
  /*******************************************************************************************************************/
  $("#less-work").click(function () {
    var workMinutes = $("#work-time").text();
    if (workMinutes > 1) {
      workMinutes--;
      displayMinutes(workMinutes, "#work-time");
      initialise(); // Changed time period so reset app
    }
  });

  /*******************************************************************************************************************/
  // More work time button click
  // Increment minutes.  99 is max.  Update new minutes value on page. Reset app as time has been changed
  /*******************************************************************************************************************/
  $("#more-work").click(function () {
    var workMinutes = $("#work-time").text();
    if (workMinutes < 99) { // ignore 3 digits it is not necessary and will stuff up the display
      workMinutes++;
      displayMinutes(workMinutes, "#work-time");
      initialise();
    }
  });

  /*******************************************************************************************************************/
  // Less rest time button click
  // Decrement minutes.  1 is least.  Update new minutes value on page. Reset app as time has been changed
  /*******************************************************************************************************************/
  $("#less-rest").click(function () {

    var workMinutes = $("#rest-time").text();
    if (workMinutes > 1) {
      workMinutes--;
      displayMinutes(workMinutes, "#rest-time");
      initialise();
    }
  });

  /*******************************************************************************************************************/
  // More rest time button click
  // Increment minutes.  99 is max.  Update new minutes value on page. Reset app as time has been changed
  /*******************************************************************************************************************/
  $("#more-rest").click(function () {
    var workMinutes = $("#rest-time").text();
    if (workMinutes < 99) { // ignore 3 digits it is not necessary and will stuff up the display
      workMinutes++;
      displayMinutes(workMinutes, "#rest-time");
      initialise();
    }
  });

  /*******************************************************************************************************************/
  // Start Button click
  // If app not running then must be click to start it. Start the 1 second timer and change button text to Stop
  // Set running flag.
  // If app was running then click is to stop it. Initiaise the app ready for a new start.  This clears flags,
  // resets image and stops the timer.
  /*******************************************************************************************************************/
  $("#start-button").click(function () {
    if (!gRunning) { // Start just pressed on stopped app
      gTimer = setInterval(manageInterval, 1000); // Provide fn name only - no params even emty ones. i,e, fn address.
      $("#start-button").text("Stop");
      gRunning = true;
    } else { // Stop pressed
      initialise();
      gRunning = false;
    }
  });

/*******************************************************************************************************************/
// Test function
// Pressing t or T will put the app in test mode by setting the work period to 0.1 and rest to 0.2 to save waiting
/*******************************************************************************************************************/

$(document).keypress(function (e) {
  if (e.keyCode === 116 || e.keyCode === 84) {
  $("#work-time").text(".1");
   $("#rest-time").text(".2");
 }
});


}); // end document ready


/*******************************************************************************************************************/
// Initialise
// If there is a timer then clear it.  Clear all flags and calculate time and angle based on current user settings
// Update the display with the timer value set.
/*******************************************************************************************************************/
function initialise() {
  if (gTimer) {
    clearInterval(gTimer);
  }
  var element = document.getElementById("tomato");
  element.className = "big-tomato"; // Set the big tomato class
  $("#start-button").text("Start");
  gImage = document.getElementById('tomato');
  gImage.src = "red-tomato-200.png";
  gWorkCountDown = gWorkSeconds = $("#work-time").text() * 60;
  gRestCountDown = gRestSeconds = $("#rest-time").text() * 60;
  gAngle = 360.0 / gWorkSeconds; // Angle value to use as incrementer
  gIncAngle = 0.0; // Accumulated angle  value
  gRunning = false;
  gWorking = true;
  gFatTomato = false;
  rotateImage(0); // Straighten up tomato
  displayTime(gWorkSeconds);
}


/*******************************************************************************************************************/
// Manage Interval
// Called repeatedly by the timer when runnning.
// If in work timer mode and timed out, display the rest image and play the end of work sound. Display the
// rest countdown time.
// If working but not timed out then rotate the image and decrement the timer
// If not working then must be resting.  If rest times out, display the work image, play the end of rest sound, 
// update the timer display with work time.
// If not working and not timed out, toggle between small image and large bouncing image by swapping small and
// big tomato classes.  Found that rotate adds a style to the image element as part of its operation and this
// was causing problems with the bounce class so used removeAttribute("style") on the element.  Rotate adds it
// back in when it is called again.
/*******************************************************************************************************************/
function manageInterval() {
  var element = document.getElementById("tomato");

  if (gWorking) {
    if (gWorkCountDown <= 0) { // Finished working
      element.removeAttribute("style"); // Rotate adds a style to image. Need to remove to enable small tomato style
      gImage.src = "green-tomato-200.png";
      element.className = "small-tomato";  // Start rest period with small tomato before bounce
      gFatTomato = true;
      gWorkEndSound.play();
      gWorking = false;
      gRestCountDown = gRestSeconds; // reset countdown value to user defined period
      displayTime(gRestCountDown);
    } else {
      rotateImage();
      displayTime(--gWorkCountDown); // Show time before countdown starts
    }
  } else { // must be resting
    if (gRestCountDown <= 0) { // rest finished
      gImage.src = "red-tomato-200.png";
      element.className = "big-tomato"; // always want big red tomato 
      gRestEndSound.play();
      gWorking = true; // Ready to start work again
      gWorkCountDown = gWorkSeconds;
      displayTime(gWorkCountDown); // Show time before countdown starts
    } else {
      if (gFatTomato) {
        element.className = "big-tomato";
        $(".image").effect("bounce", {direction: "up", distance: 100, times: 2}, 500);
        gFatTomato = false;
      } else {
        gFatTomato = true;
        element.className = "small-tomato";
      }
      displayTime(--gRestCountDown);
    }
  }
}


/*******************************************************************************************************************/
// Rotate Image
// rotate takes various params - more than used here so look it up at http://jqueryrotate.com/
// Here, there is a globl angle calculated using the time the user has asked for. This is added to the cumulative
// angle to position the div.  The args are passed in in json format. Can use real numbers for angle. Angle is 
// in degrees not radians.  
/*******************************************************************************************************************/
function rotateImage() {
  
  $("#tomato").rotate({
    angle: gIncAngle,
    center: ["50%", "50%"]
  });
  
  gIncAngle += gAngle;
}

/*******************************************************************************************************************/
// Display Time
// Calculate minutes and seconds from seconds.  Add leading zero if needed for 2 char display. If working/ resting, 
// use jss library function to change the cont colour of the time. Update the time on the page.
/*******************************************************************************************************************/
function displayTime(seconds) {
  var minutes = 0;
  var minStr = "";

  minutes = Math.floor(seconds / 60);
  if (minutes === 0) {
    minStr = "00";
  } else
  if (minutes < 10) {
    minStr = "0" + minutes.toString();
  } else {
    minStr = minutes.toString();
  }

  seconds = seconds % 60;
  if (seconds === 0) {
    secStr = "00";
  } else
  if (seconds < 10) {
    secStr = "0" + seconds.toString();
  } else {
    secStr = seconds.toString();
  }

  // jss is a library that simplifies changing css properties directly
  if (gWorking) {
    jss.set('#time', {'color': '#ee3726'});
  } else {
    jss.set('#time', {'color': 'green'});
  }

  $("#time").text(minStr + ":" + secStr);
}


/*******************************************************************************************************************/
// Display Minutes
// Single place to dispay minutes set by user for work and rest.  Write the number of minutes supplied to the
// provided element.  Add leading zero if needed to keep 2 digit display.
/*******************************************************************************************************************/
function displayMinutes(minutes, element) {
  minStr = "";

  if (minutes <= 9) {
    minStr = "0" + minutes.toString();
  } else {
    minStr = minutes.toString();
  }

  $(element).text(minStr);
}


