const GETHANDLE = 'https://data.metropolis.drib.net/get_handle'

function setup() {
  print("SETTING UP!")
  frameRate(4);

  window.onhashchange = locationHashChanged;

  syncButton = createButton('');
  syncButton.mousePressed(syncUnsyncPressed);
  syncButton.parent('ui_sync');
  updateSyncUnsyncButton();
}

function syncUnsyncPressed() {
  if (syncButton.elt.innerText == 'sync') {
    print("SYNC");
    if(window.tz != null && window.tz.address != null) {
      print("WAS SYNCED");
      syncButton.elt.innerText = 'unsync';
      return;
    }
    if (window.tz != null && window.tz.handle_sync != null) {
      print("SYNCING");
      window.tz.handle = null;
      window.tz.handle_sync();
      return;
    }
  }
  if (syncButton.elt.innerText == 'unsync') {
    print("UNSYNC");
    if(window.tz != null && window.tz.address == null) {
      print("WAS UNSYNCED");
      syncButton.elt.innerText = 'sync';
      return;
    }
    if (window.tz != null && window.tz.handle_unsync != null) {
      print("UNSYNCING");
      window.tz.handle = null;
      window.tz.handle_unsync();
      return;
    }
  }
}

async function fetchHandleFromAddress() {
  if(window.tz != null && window.tz.address != null) {
    let response = await fetch(GETHANDLE + "?" + window.tz.address);
    let handle = await response.text();
    console.log("Setting handle to " + handle);
    window.tz.handle = handle;
  }
}

function updateSyncUnsyncButton() {
  if(window.tz != null && window.tz.address != null) {
    syncButton.elt.innerText = 'unsync';
    if (window.tz.handle == null) {
      fetchHandleFromAddress();
    }
    else {
      console.log("HANDLE was already " + window.tz.handle);
    }
  }
  else if (window.tz != null && window.tz.address == null) {
    syncButton.elt.innerText = 'sync';
  }
  else {
    syncButton.elt.innerText = '?';
  }
}

function draw() {
  print("Drawing...");
}

function locationHashChanged() {
  if(window.location.hash == "#recover") {
    console.log("recover state called. reverting: ");
    // checkMintPost();
    // hideMint();
    updateSyncUnsyncButton();
    window.location.hash = "";
    return;    
  }
}

let market_is_shown = false;
function toggleMarket() {
  let target = document.getElementById("market");
  if (market_is_shown) {
    target.style.opacity = "0.0";
    market_is_shown = false;
  }
  else {
    target.style.opacity = "1.0";  
    market_is_shown = true;
  }
}

help_is_shown = false;
function toggleHelp() {
  let target = document.getElementById("help");
  if (help_is_shown) {
    target.style.opacity = "0.0";  
    target.style.display = "none";
    help_is_shown = false;
  }
  else {
    target.style.display = "block";
    target.style.opacity = "0.95";  
    help_is_shown = true;
  }
}

function respondToMessage(d) {
  console.log(d);
}

// window.addEventListener("message", (event) => {
//   respondToMessage(event.data);
// })
