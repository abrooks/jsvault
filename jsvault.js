//vpw="asdfg";
var data, editingIndex;

function editacct(n) {
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
    $('#created').html(acct.created || "");
    $('#modified').html(acct.modified || "");
  }
  else {
    $('#title').focus();
  }
}

function dbfilename() {
  return $('#vuser').val() + "-" + sha1Hash($('#vpw').val()) + ".txt";
}

function cleareditform(){ 
  $('#title').val('');
  $('#url').val('');
  $('#username').val('');
  $('#password').val('');
  $('#tags').val('');
  $('#comments').val('');
}

$(function() {
  $('#vpw').focus();
  $('#msg').hide();
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

  $('#locknow').click(function() {
    $('#treasure').hide();
    data = null;
    $('#results').empty();
    $('#vpw').val(''); // clear the passphrase
    $('#vpwform').fadeIn("slow");
    $('#vpw').focus();
  });

  $('#newacct').click(editacct);

  $('#editform').submit(function(){
    // ok: save
    var date = "" + (new Date());
    var newacct = {
      title: $('#title').val(),
      url: $('#url').val(),
      username: $('#username').val(),
      password: $('#password').val(),
      tags: $.trim($('#tags').val()).split(/ *, */),
      comments: $('#comments').val(),
      modified: date
    };
    if(editingIndex >= 0) {
      $.extend(data.accounts[editingIndex], newacct);
      var oldtr = $($('#results > tr')[editingIndex]);
      oldtr.after(makeacctrow(newacct, editingIndex));
      oldtr.remove();
    }
    else {
      newacct.created = date;
      editingIndex = data.accounts.length;
      data.accounts[editingIndex] = newacct;
      $('#results').append(makeacctrow(newacct, editingIndex));
    }

    $('#editform .submitflash').fadeIn(50,
      function(){$('#editform .submitflash').fadeOut(200,
        function(){$('#editform').slideUp('fast', cleareditform);});
      });

    $.ajax({
      url: "save.cgi/" + dbfilename(),
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
          alert("Application error saving db:" + data);
        }
      }
    });

    return false;
  });
  $('.editbuttons button').click(function(){
    // cancel:
    $('#editform').slideUp('fast', cleareditform);
    return false;
  });

  $('#vpwform').submit(function() {
    try {
      $('#msg').slideUp("fast");

      $.ajax({
        url: "db/" + dbfilename(),
        type: 'GET',
        error: function(req, stat, err) {
          $('#msg').html("Incorrect username or passphrase.  Please try again.");
          $('#msg').slideDown("slow");
        },
        success: function(aesdata, stat) {
          var jsontext = AesCtr.decrypt($.trim(aesdata),$('#vpw').val(),256);
          if(/^{.*}$/.exec(jsontext)) {
            // probably correct passphrase
            $('#treasure').fadeIn("fast");
            $('#vpwform').fadeOut("slow");
            $('#search').focus();

            // Don't clear the passphrase -- we might want it to encrypt
            // something while we're unlocked.

            try {
              data = eval("(" + jsontext + ")");
            }
            catch(e) {
              $('#msg').html("Possible database corruption. #E1");
              $('#msg').slideDown("slow");
            }
            var accts = data.accounts;
            var acctlen = accts.length;
            var tbody = $('#results');
            $.each(accts, function(i, acct) {
              tbody.append(makeacctrow(acct, i));
            });
          }
          else {
            $('#msg').html("Possible database corruption. #E2");
            $('#msg').slideDown("slow");
          }
        }
      });
    }
    finally {
      return false;
    }
  });
});
