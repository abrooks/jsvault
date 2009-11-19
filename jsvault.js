//pw="asdfg";

function $(id) {
  return document.getElementById(id);
}

function formloaded() {
  $('pw').focus();
}

function node(tag, text) {
  var elem = document.createElement(tag);
  elem.appendChild(document.createTextNode(text));
  return elem;
}

function dopw(form) {
  try {
	//$('pwform').innerHTML = AesCtr.encrypt(JSON.stringify(jsdb),form.pw.value,256);
	//$('pwform').innerHTML = AesCtr.encrypt(x,form.pw.value,256);
	//return false;
	$('msg').innerHTML = "";

	var jsontext = AesCtr.decrypt(db,form.pw.value,256);
	if(/^{.*}$/.exec(jsontext)) {
	  // probably correct passphrase
	  $('treasure').style.display = "block";
	  $('pwform').style.display = "none";
	  $('search').focus();

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
	  var tbody = $('results');
	  var tr, td;
	  for(var i = 0; i < acctlen; ++i) {
		tr = document.createElement('tr');
		tr.appendChild(node('td', accts[i].title));
		tr.appendChild(node('td', accts[i].username));

		td = node('td', accts[i].password);
		td.setAttribute('class','pw');
		tr.appendChild(td);

		tr.appendChild(node('td', accts[i].comments || ""));
		tbody.appendChild(tr);
	  }
	}
	else {
	  $('msg').innerHTML = "Incorrect passphrase.  Please try again.";
	}
  }
  finally {
	return false;
  }
}

function lock() {
  $('treasure').style.display = "";
  $('results').innerHTML = "";
  $('pw').value = ''; // clear the passphrase
  $('pwform').style.display = "";
  $('pw').focus();
}
