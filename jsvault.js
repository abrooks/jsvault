//pw="asdfg";
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

$(function() {
  $('#pw').focus();
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
    $('#pw').val(''); // clear the passphrase
    $('#pwform').fadeIn("slow");
    $('#pw').focus();
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
        function(){$('#editform').slideUp('fast',
          function(){ 
            $('#title').val('');
            $('#url').val('');
            $('#username').val('');
            $('#password').val('');
            $('#tags').val('');
            $('#comments').val('');
          });
        });
      });

    alert("db='" + AesCtr.encrypt(JSON.stringify(data),$('#pw').val(),256) + "'");
    return false;
  });
  $('.editbuttons button').click(function(){
    // cancel:
    $('#editform').slideUp('fast', function(){
      $('#title').val('');
      $('#url').val('');
      $('#username').val('');
      $('#password').val('');
      $('#tags').val('');
      $('#comments').val('');
    });
    return false;
  });

  $('#pwform').submit(function() {
    try {
      $('#msg').slideUp("fast");

      var jsontext = AesCtr.decrypt(db,$('#pw').val(),256);
      if(/^{.*}$/.exec(jsontext)) {
        // probably correct passphrase
        $('#treasure').fadeIn("fast");
        $('#pwform').fadeOut("slow");
        $('#search').focus();

        // Don't clear the passphrase -- we might want it to encrypt something
        // while we're unlocked.

        try {
          data = eval("(" + jsontext + ")");
        }
        catch(e) {
          alert(e);
        }
        var accts = data.accounts;
        var acctlen = accts.length;
        var tbody = $('#results');
        $.each(accts, function(i, acct) {
          tbody.append(makeacctrow(acct, i));
        });
      }
      else {
        $('#msg').html("Incorrect passphrase.  Please try again.");
        $('#msg').slideDown("slow");
      }
    }
    finally {
      return false;
    }
  });
});
