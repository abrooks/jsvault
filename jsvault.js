//vpw="asdfg";
var data, editingIndex;
var cgi = "cgi-bin/save.cgi";

function editacct(n) {
  $('#menu').slideUp('fast');
  editingIndex = n;
  if(n >= 0) {
    $('.editonly').show();
  }
  else {
    $('.editonly').hide();
  }
  $('#editform').slideDown('fast');
  $('#editform .submitflash').fadeOut("fast");
  if(n >= 0) {
    acct = data.accounts[n];
    $('#title').val(acct.title || "");
    $('#url').val(acct.url || "");
    $('#username').val(acct.username || "");
    $('#password').val(acct.password || "");
    $('#tags').val(acct.tags.join(", ") || "");
    $('#comments').val(acct.comments || "");
    $('#created').html(acct.created ? "" + new Date(acct.created) : "");
    $('#modified').html(acct.modified ? "" + new Date(acct.modified) : "");
  }
  else {
    $('#title').focus();
  }
}

function dbfilename() {
  return $('#vuser').val() + "-" + sha1Hash($('#vpw').val()) + ".txt";
}

function cleareditform() { 
  $('#title').val('');
  $('#url').val('');
  $('#username').val('');
  $('#password').val('');
  $('#tags').val('');
  $('#comments').val('');
}

function pwerr(html) {
  $('#msg').slideUp("fast", function() {
    $('#msg').html(html);
    $('#msg').slideDown("slow");
  });
}

$(function() {
  $('#vpw').focus();
  $('#msg').hide();
  $('.vpwconf').hide();
  $('#login').hide();
  var acctrow = $('#results tr').clone();
  $('#results').empty();

  function makeacctrow(acct, i) {
    var tr = acctrow.clone();
    $('.title', tr).html(acct.title);
    $('.title', tr).click(function(){ editacct(i); return false; });
    $('.username', tr).html(acct.username);
    $('.pw', tr).html(acct.password);
    $('.comments', tr).html(acct.comments);
    return tr;
  }

  $('.locknow').click(function() {
    $('#treasure').hide();
    data = null;
    $('#results').empty();
    $('#vpw').val(''); // clear the passphrase
    $('#vpwform').fadeIn("slow");
    $('#vpw').focus();
  });

  var menu = $('#menu').hide();
  $('#menubtn').click(function(){
    if(menu.css('display') == 'none') {
      menu.slideDown('fast');
    }
    else {
      menu.slideUp('fast');
    }
  });

  $('.newacct').click(editacct);

  $('#editform').submit(function(){
    // ok: save
    var time = (new Date()).getTime();
    var newacct = {
      title: $('#title').val(),
      url: $('#url').val(),
      username: $('#username').val(),
      password: $('#password').val(),
      tags: $.trim($('#tags').val()).split(/ *, */),
      comments: $('#comments').val(),
      modified: time
    };
    if(editingIndex >= 0) {
      var oldacct = data.accounts[editingIndex];
      var oldcopy = $.extend({}, oldacct);
      delete oldcopy.created;
      delete oldcopy.history;
      $.extend(oldacct, newacct);
      if(! oldacct.history) oldacct.history = [];
      oldacct.history[oldacct.history.length] = oldcopy;
      var oldtr = $($('#results > tr')[editingIndex]);
      oldtr.after(makeacctrow(newacct, editingIndex));
      oldtr.remove();
    }
    else {
      newacct.created = time;
      editingIndex = data.accounts.length;
      data.accounts[editingIndex] = newacct;
      $('#results').append(makeacctrow(newacct, editingIndex));
    }

    $('#editform .submitflash').fadeIn(50,
      function(){$('#editform .submitflash').fadeOut(200,
        function(){$('#editform').slideUp('fast', cleareditform);});
      });

    $.ajax({
      url: cgi + "/replace/" + dbfilename() + "?" + (new Date()).getTime(),
      cache: false,
      type: 'POST',
      contentType: "text/plain",
      data: AesCtr.encrypt(JSON.stringify(data),$('#vpw').val(),256),
      error: function(req, stat, err) {
        alert("HTTP error saving db: " + stat + ", " + err );
      },
      success: function(data, stat) {
        if($.trim(data) == "OK") {
          // Success
        }
        else {
          alert(data || "Unknown application error saving db");
        }
      }
    });

    return false;
  });
  $('#editform button').click(function(){
    // cancel:
    $('#editform').slideUp('fast', cleareditform);
    return false;
  });

  $('.import').click(function() {
    $('#importform').slideDown('fast');
    $('#importform .submitflash').fadeOut("fast");
    $('#menu').slideUp('fast');
  });
  function clearimport() {
    $('#import').val('');
  };
  $('#importform button').click(function(){
    // cancel:
    $('#importform').slideUp('fast', clearimport);
    return false;
  });
  $('#importform').submit(function(){
    // ok: save
    $('#importform .submitflash').fadeIn(50,
      function(){$('#importform .submitflash').fadeOut(200,
        function(){$('#importform').slideUp('fast', clearimport);});
      });

  $.each($('#import').val().split(/\n/), function(i, line) {
    var fields = line.split(/\t/);
    // XXX work here
  });

    return false;
  });

  $('#vpwform').submit(function() {
    try {
      if($('#vpwform-submit').val() == "Unlock") {
        // Unlock / login
        $.ajax({
          url: "db/" + dbfilename(),
          cache: false, // XXX this probably prevents us from working offline
          type: 'GET',
          error: function(req, stat, err) {
            pwerr("Incorrect username or passphrase.  Please try again.");
          },
          success: function(aesdata, stat) {
            var jsontext = AesCtr.decrypt($.trim(aesdata),$('#vpw').val(),256);
            if(/^{.*}$/.exec(jsontext)) {
              // probably correct passphrase
              // Don't clear the passphrase -- we might want it to encrypt
              // something while we're unlocked.

              try {
                data = eval("(" + jsontext + ")");
              }
              catch(e) {
                pwerr("Possible database corruption. #E1");
                return;
              }
              $('#msg').slideUp("fast");
              $('#treasure').fadeIn("fast");
              $('#vpwform').fadeOut("slow");
              $('#search').focus();

              var accts = data.accounts;
              var acctlen = accts.length;
              var tbody = $('#results');
              $.each(accts, function(i, acct) {
                tbody.append(makeacctrow(acct, i));
              });
            }
            else {
              pwerr("Possible database corruption. #E2");
            }
          }
        });
      }
      else {
        // Create new user
        if($('#vpw').val() != $('#vpwconf').val()) {
          pwerr("Passwords don't match.  Please try again.");
        }
        else {
          data = {tags: [], accounts: []};
          $.ajax({
            url: cgi + "/create/" + dbfilename(),
            cache: false,
            type: 'POST',
            contentType: "text/plain",
            data: AesCtr.encrypt(JSON.stringify(data),$('#vpw').val(),256),
            error: function(req, stat, err) {
              pwerr("HTTP error creating db: " + stat + ", " + err );
            },
            success: function(data, stat) {
              if($.trim(data) == "OK") {
                // Success
                $('#msg').slideUp("fast");
                $('#treasure').fadeIn("fast");
                $('#vpwform').fadeOut("slow");
                $('#newacct').focus();
              }
              else {
                pwerr(data || "Unknown application error creating db");
              }
            }
          });
        }
      }
    }
    finally {
      return false;
    }
  });

  $('#newuser').click(function() {
    $('.vpwconf').slideDown('fast');
    $('#vpwform-submit').val('Create User');
    $('#newuser').fadeOut('fast');
    $('#login').fadeIn('fast');
    return false;
  });

  $('#login').click(function() {
    $('.vpwconf').slideUp('fast');
    $('#vpwform-submit').val('Unlock');
    $('#newuser').fadeIn('fast');
    $('#login').fadeOut('fast');
    return false;
  });
});
