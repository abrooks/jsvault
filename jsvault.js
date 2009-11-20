//pw="asdfg";

$(function() {
  $('#pw').focus();
  $('#msg').hide();
  var acctrow = $('#results tr').clone();
  $('#results').empty();
  $('#pwform').submit(function() {
    try {
      //$('pwform').innerHTML = AesCtr.encrypt(JSON.stringify(jsdb),form.pw.value,256);
      //$('pwform').innerHTML = AesCtr.encrypt(x,form.pw.value,256);
      //return false;
      $('#msg').slideUp("fast");

      var jsontext = AesCtr.decrypt(db,$('#pw').val(),256);
      if(/^{.*}$/.exec(jsontext)) {
        // probably correct passphrase
        $('#treasure').fadeIn("slow");
        $('#pwform').fadeOut("slow");
        $('#search').focus();

        // Don't clear the passphrase -- we might want it to encrypt something
        // while we're unlocked.

        var data;
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
          var tr = acctrow.clone();
          $('.title', tr).html(acct.title);
          $('.title', tr).click(function(){
	    alert("TBD: Edit " + acct.title);
	    return false;
	  });
          $('.username', tr).html(acct.username);
          $('.pw', tr).html(acct.password);
          $('.comments', tr).html(acct.comments);
          tbody.append(tr);
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

function lock() {
  $('#treasure').hide();
  $('#results').empty();
  $('#pw').val(''); // clear the passphrase
  $('#pwform').fadeIn("slow");
  $('#pw').focus();
}

function newacct() {
  alert("TBD: Edit new account");
}
