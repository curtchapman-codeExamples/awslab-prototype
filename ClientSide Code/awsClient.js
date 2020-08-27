//jshint esversion:8

// -------------------- AWS LAB LOADER (CLIENT SIDE) ---------------

var countDownDate = new Date("Feb 1, 2020 13:20:20").getTime();
var loadingDiv = $('.loaderDiv');
var formArray = $('.runLabForm');
var bootStatus = "loading";
var msgList = [
  "Contacting Impenetrable Servers",
  "Parsing userInfo",
  "Creating flag.txt File",
  "Initialising Log Reports",
  "Putting a Brew On",
  "Fishing in an S3 Bucket",
  "Hiding files",
  "Testing Edgecase Scenarios",
  "Fetching a Biscuit",
  "Generating the Custom Instance",
  "Preparing Unique IP",
  "Any Minute Now"
];

var msgInt = 0;

//ADD LISTENERS TO EJS GENERATED FORM
for (var x = 0; x < formArray.length; x++) {
  formArray[x].submit(function(event) {

    //information regarding commission module
    var id = this.elements.modId.value;
    var code = this.elements.modCode.value;
    var name = this.elements.modName.value;

    var index = x;
    $('#compListDisplay :input').attr('disabled', true);

    event.preventDefault();

    //data populated for AJAX POST
    var data = {
      id: id,
      code: code,
      instance: 'start',
    };

    msgInt = 0;

    //Generate the overlay "loading Div"
    $('#compOverlayTitle').append("<h3>"+ name + "</h3>");
    $('#statusSpinner').append("<h5> Status: Loading </h5> <br/>");
    $('#compOverlay').fadeIn(400);
    $('#statusUpdate').append('<div class="loading loaderDiv"></div>' + '');
    $(loadingDiv[0]).text(msgList[msgInt]);
    $(loadingDiv[0]).slideDown(400);

    //call runLab on the BackEnd
    $.ajax({
      type: 'POST',
      data: data,
      json: true,
      contentType: 'application/x-www-form-urlencoded',
      url: 'runLab',
      success: function(data) {
        console.log('success');
        data = {ipAddress: 'NotRunningYet' };
        waitforLab(id, code, data);
      },
      error: function(error) {
        console.log("some error in fetching the notifications");
      }
    });
  });
}

function prePoll(id, code){
    pollLabStatus(id, code);
}

function waitforLab(id, code, data) {

  if(data.ipAddress === "NotRunningYet"){
    bootStatus = "loading";
  } else {
      bootStatus = "loaded";
      console.log(data.ipAddress);
      var url = data.ipAddress;
  }

  if (bootStatus === "loading"){
    setTimeout(function() {
      if (msgInt < (msgList.length-1)) {
        $(loadingDiv[0]).append(" <small>(complete)</small>");
        $(loadingDiv[0]).addClass("loadingComplete");
        $(loadingDiv[0]).removeClass("loading");
        msgInt++;
        $('#statusUpdate').prepend('<div class="loading loaderDiv"></div>'+'');
        $(loadingDiv[0]).text(msgList[msgInt]);
        $(loadingDiv[0]).slideDown(400);
      }
      prePoll(id, code);
    }, 4000);
  } else {
    // var url = bootStatus.url;
    $('#statusSpinner').text("");
    $('.spinner-border').toggle();
    $('#statusSpinner').append("<h5> Status: Running </h5> <br/>");
    $('#statusUpdate').fadeOut(300, function(){
      $('#statusUpdate').empty();
      labLoaded(id, code, url);
    });
  }
}

function pollLabStatus(id, code) {
  var msg;
  var data = {
    id: id,
    code: code,
    instance: 'poll',
  };

  $.ajax({
    type: 'POST',
    data: data,
    json: true,
    contentType: 'application/x-www-form-urlencoded',
    url: 'pollLab',
    success: function(data) {
      console.log('success');
      waitforLab(id, code, data);
    },
    error: function(error) {
      console.log("some error in fetching the notifications");
    }
  });
}


function labLoaded(id, code, url) {
  $('#statusUpdate').fadeIn(300, function(){
    $('#statusUpdate').append('<div id="loadedGUI"></div>');
    $('#loadedGUI').append('<div id="labTimeLabel"><b>Time Remaining </b></div><div id="labTimer">: - </div>');
    $("#labTimer").text(": - ");
    $('#loadedGUI').append('<button class="btn  btn-success" id="labStart">Open Page</button>');
    $('#loadedGUI').append('<button class="btn  btn-outline-danger" id="labCancel">Close Instance</button>');
    countRemaining();
    // START IS CLICKED -  OPEN WEBPAGEPAGE
    $('#loadedGUI').on('click','#labStart', function(){
      window.open('http://' + url, '_blank');
    });

    // CANCEL IS CLICKED - SHUT DOWN AWS INSTANCE AND CLOSE LOADER
    $('#loadedGUI').on('click','#labCancel', function(){

      closeLab();

      var data = {
        id: id,
        code: code,
        instance: 'stop',
      };

      $.ajax({
        type: 'POST',
        data: data,
        json: true,
        contentType: 'application/x-www-form-urlencoded',
        url: 'stopLab',
        success: function(data) {
          console.log('success');
          closeLab();
        },
        error: function(error) {
          console.log("some error in fetching the notifications");
        }
      });
    });
  });
}

function closeLab(){
  $('#loadedGUI :input').attr('disabled', true);
  $('.spinner-border').toggle();
  $('#statusSpinner').text("");
  $('#statusSpinner').append("<h5> Status: Logging off </h5> <br/>");

  setTimeout(function() {
    // ^^^ CHANGE TO AN AJAX CALLBACK TO B/E THAT ADJUSTS TIMELEFT ON MODULE
    $('.spinner-border').toggle();
    $('#statusUpdate').empty();
    $('#compOverlayTitle').text("");
    $('#statusSpinner').text("");
    $('#compOverlay').fadeOut(400, function() {
      $('#compListDisplay :input').attr('disabled', false);
      $('.spinner-border').toggle();
    });
  },2000);
}

function countRemaining(){
  countDownDate = new Date("Feb 29, 2020 00:00:00").getTime();
  var isExpired = getCurrentTimer();
  if(!isExpired){
    var x = setInterval(function() {
      isExpired = getCurrentTimer();
      if(isExpired){
        clearInterval(x);
      }
    }, 1000);
  }
}

function getCurrentTimer(){
  var now = new Date().getTime();
  var distance = countDownDate - now;
  var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
  var seconds = Math.floor((distance % (1000 * 60)) / 1000);
  $("#labTimer").text(": " + hours + "h " + minutes + "m " + seconds + "s ");

  if (countDownDate < now) {
    $('#statusSpinner').text("");
    $('#statusSpinner').append("<h5> Status: Stopped </h5> <br/>");
    $("#labTimer").text(": EXPIRED");
    $('#labStart').attr('disabled', true);
    return true;
  } else { return false; }
}
