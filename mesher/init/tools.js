// Tool init file, used for including default tools.

// Loads on page load
$(function(){
    new Tool(
      "Scale",
      "&times;",
      null,
      {min: 0, max: 3, step: 0.01, val: 1},
      Scale
    ).go()
});

$(function(){
    new Tool(
      "Rotate",
      "deg.",
      null,
      {min: -180, max: 180, step: 0.01, val: 0},
      Rotate
    ).go()
});

$(function(){
    new Tool(
      "Shift",
      "pt.",
      null,
      {min: -20, max: 20, step: 0.01, val: 0},
      Shift
    ).go()
});

// example of anonymous function passing
/*
$(function(){
    new Tool(
      "Alert",
      "pt.",
      null,
      {min: -20, max: 20, step: 0.01, val: 0},
      function(x, y, z){ 
        alert(x); 
      }
    ).go()
});
*/