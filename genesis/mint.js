const GETHANDLE = 'https://data.metropolis.drib.net/get_handle'
let syncButton = null;
let mintButton = null;

let original_location = null;

function setup() {
  print("SETTING UP!")
  frameRate(1);

  original_location = window.location.href;
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

let suspendInput = false;
function mintPressed() {
  suspendInput = true;
  let rootDiv = document.getElementById("root");
  rootDiv.style.opacity = "0.95";  
  rootDiv.style.display = "block";
  // mintingElementSwap(true);
  if(window.tz && window.tz.mint_metropolis) {
    window.tz.mint_metropolis();
  }
  console.log("HIC interface enabled");
}

function hideMint() {
  let rootDiv = document.getElementById("root");
  rootDiv.style.opacity = "0.0";
  setTimeout(function() {rootDiv.style.display = "none";}, 300);
  // mintingElementSwap(false);
  suspendInput = false;
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
    hideMint();
    updateSyncUnsyncButton();
    window.location.href = original_location;
    window.location.hash = "";
    return;    
  }
}

function getCurrentTzAddress() {
  if(window.tz != null && window.tz.address != null) {
    return window.tz.address;
  }
  else {
    return null;
  }
}

function setupMintData(resultObj) {
  let objkt_file = {
    "title": "Upload OBJKT",
    "mimeType": "image/png",
  };
  objkt_file.reader = resultObj.dataUrl;
  objkt_file.buffer = resultObj.buffer;
  objkt_file.file = resultObj.blob;
  // objkt_file.reader = null;
  // objkt_file.buffer = null;
  // objkt_file.file = null;

  let infoData = "https://pixray.gob.io/genesis/";

  let dateStr = new Date().toDateString();
  let walletStr = getCurrentTzAddress();
  let showName = walletStr;
  window.tz = window.tz || {};
  let tags = "pixray_genesis,generative,pixray,p5,generativeart,png"
  window.tz.minting_location = "none";
  window.tz.minting_wallet = walletStr;
  window.tz.mintData = {
    "title": "Title Pending (pixray_genesis)",
    "description": "Description here.\n" + 
      "Settings here.\n" +
      "This location discovered and minted by " + showName + " " + dateStr + ".\n" +
      infoData.Url,
    "tags": tags,
    "royalties": 10,
    "file": objkt_file,
    "mint_fee": 1
  }  

  result_is_ready = true;
  updateMintButton();
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

//**blob to dataURL**
// https://stackoverflow.com/a/30407959/1010653
function blobToDataURL(blob, callback) {
    var a = new FileReader();
    a.onload = function(e) {callback(e.target.result);}
    a.readAsDataURL(blob);
}

function prepareImage(p5cb) {
  let img_w = p5cb.img.width;
  let img_h = p5cb.img.height;
  print("IMG COMPLETE: " + img_w +","+ img_h)


  let walletStr = getCurrentTzAddress();
  let showName = walletStr;
  window.tz = window.tz || {};
  if (window.tz.handle != null) {
    showName = window.tz.handle + " / " + walletStr;
  }
  infoUrl = "https://pixray.gob.io/genesis/"
  let description = "Created by " + showName + ".\n" + infoUrl;
  let dateStr = new Date().toDateString();

  // TODO: fix metadata
  let metadata = {
    "tEXt": {
      "Title":            "pixray",
      "Author":           "dribnet",
      "Description":      description,
      "Copyright":        "(c) 2021 Tom White (dribnet)",
      "Software":         "pixray",
      // "Disclaimer":       "",
      // "Warning":          "",
      "Source":           infoUrl,
      "Comment":          dateStr
    }
  }

  var offscreenCanvas = document.createElement('canvas');
  offscreenCanvas.width = img_w;
  offscreenCanvas.height = img_h;
  var context = offscreenCanvas.getContext('2d');
  // background is flat white
  context.fillStyle="#FFFFFF";
  context.fillRect(0, 0, img_w, img_h);
  context.drawImage(p5cb.canvas, 0, 0, img_w, img_h);

  // https://jsfiddle.net/donmccurdy/jugzk15b/
  const mimeType = 'image/png';
  // Convert canvas to Blob, then Blob to ArrayBuffer.
  offscreenCanvas.toBlob((blob) => {
    const reader = new FileReader();
    reader.addEventListener('loadend', () => {
      const arrayBuffer = reader.result;
      // console.log(arrayBuffer.byteLength + ' bytes.');
      // console.log(arrayBuffer);
      let uint8View = new Uint8Array(arrayBuffer);
      // console.log(uint8View[0], uint8View[1]);
      const chunks = extractChunks(uint8View);
      // console.log(chunks);
      insertMetadata(chunks, metadata);
      // console.log(chunks);
      let freshUint8View = encodeChunks(chunks)
      const newBlob = new Blob([freshUint8View.buffer], {type: mimeType});
      blobToDataURL(newBlob, function(dataurl){
        // https://stackoverflow.com/a/40606838/1010653
        // const parent = document.getElementById("offscreenContainer")
        // while (parent.firstChild) {
        //     parent.firstChild.remove()
        // }

        if (document.contains(document.getElementById("defaultCanvas1"))) {
                    document.getElementById("defaultCanvas1").remove();
        }

        // offscreenCanvas.remove();
        // offscreenCanvas.parentNode.removeChild(offscreenCanvas);
        setupMintData({"dataUrl":dataurl, "blob": newBlob, "buffer": freshUint8View});
      });
    });
    reader.readAsArrayBuffer(blob);
  }, mimeType);
}

function beginFetchImage(img_src) {
  var s = function( p ) {
    p.img = null;

    p.preload = function() {
      console.log("P PRELOAD START")
      p.img = p.loadImage(img_src);
      console.log("P PRELOAD END")
    }

    p.setup = function() {
      console.log("P SETUP " +  p.img.width +","+ p.img.height)
      p.createCanvas(p.img.width, p.img.height);
      p.noLoop();
    };

    p.draw = function() {
      p.background(0);
      p.image(p.img, 0, 0);
      console.log("P DRAW DONE " +  p.img.width +","+ p.img.height);
      prepareImage(this);
    }
  }

  let p5cb = new p5(s);
  p5cb.redraw();  
}

let result_is_ready = false;
let standby_image = "placeholder.png";
function refreshResult(new_image) {
  // let target = document.getElementById("result_img");
  if (new_image == null) {
    result_is_ready = false;
    // target["src"] = standby_image;
    updateMintButton();
  }
  else {
    // target["src"] = new_image;
    beginFetchImage(standby_image);
  }
  // console.log("UPDATED TO " + new_image);
}

function respondToMessage(d) {
  // console.log(d);
  if (!d.hasOwnProperty('name') || (d["name"] != "prediction")) {
    // console.log("NO PREDICTION")
    return;
  }
  if (d["data"]["status"] == "success") {
    print(d);
    refreshResult("https://replicate.ai" + d["data"]["output_file"]);
  }
  else if (result_is_ready) {
    refreshResult(null);
  }
}

window.addEventListener("message", (event) => {
  respondToMessage(event.data);
})
