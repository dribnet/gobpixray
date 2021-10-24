const GETHANDLE = 'https://data.metropolis.drib.net/get_handle'
let syncButton = null;
let mintButton = null;

function setup() {
  print("SETTING UP!")
  frameRate(1);

  window.onhashchange = locationHashChanged;

  syncButton = createButton('');
  syncButton.mousePressed(syncUnsyncPressed);
  syncButton.parent('ui_sync');

  mintButton = createButton('mint');
  mintButton.mousePressed(mintPressed);
  mintButton.parent('ui_sync');
  mintButton.attribute('disabled', '');

  updateSyncUnsyncButton();
}

function mintPressed() {
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

let is_synced = false;
function updateSyncUnsyncButton() {
  if(window.tz != null && window.tz.address != null) {
    is_synced = true;
    syncButton.elt.innerText = 'unsync';
    if (window.tz.handle == null) {
      fetchHandleFromAddress();
    }
    else {
      console.log("HANDLE was already " + window.tz.handle);
    }
  }
  else if (window.tz != null && window.tz.address == null) {
    is_synced = false;
    syncButton.elt.innerText = 'sync';
  }
  else {
    is_synced = false;
    syncButton.elt.innerText = '?';
  }
  updateMintButton();
}

function updateMintButton() {
  if(is_synced && result_is_ready) {
    // Re-enable the button
    mintButton.removeAttribute('disabled');
  }
  else {
    // Disable the button
    mintButton.attribute('disabled', '');
  }  
}

function draw() {
  // print("Drawing...");
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

let help_is_shown = false;
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


let result_is_ready = false;
let standby_image = "placeholder.png";
function refreshResult(new_image) {
  let target = document.getElementById("result_img");
  if (new_image == null) {
    result_is_ready = false;
    target["src"] = standby_image;
  }
  else {
    result_is_ready = true;
    target["src"] = new_image;
  }
  updateMintButton();
  // console.log("UPDATED TO " + new_image);
}

function respondToMessage(d) {
  // console.log(d);
  if (!("name" in d) || (d["name"] != "prediction")) {
    // console.log("NO PREDICTION")
    return;
  }
  if (d["data"]["status"] == "success") {
    refreshResult("https://replicate.ai" + d["data"]["output_file"]);
  }
  else if (result_is_ready) {
    refreshResult(null);
  }
}

window.addEventListener("message", (event) => {
  respondToMessage(event.data);
})
