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
  if (market_is_shown) {
    toggleMarket();
  }
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

let market_is_shown = false;
function toggleMarket() {
  let target = document.getElementById("market");
  if (market_is_shown) {
    target.style.opacity = "0.0";
    target.style.display = "none";
    market_is_shown = false;
  }
  else {
    target.style.opacity = "1.0";  
    target.style.display = "block";
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

// https://gist.github.com/sebleier/554280
const stopWords = ["i", "me", "my", "myself", "we", "our", "ours", "ourselves", "you", "your", "yours", "yourself", "yourselves", "he", "him", "his", "himself", "she", "her", "hers", "herself", "it", "its", "itself", "they", "them", "their", "theirs", "themselves", "what", "which", "who", "whom", "this", "that", "these", "those", "am", "is", "are", "was", "were", "be", "been", "being", "have", "has", "had", "having", "do", "does", "did", "doing", "a", "an", "the", "and", "but", "if", "or", "because", "as", "until", "while", "of", "at", "by", "for", "with", "about", "against", "between", "into", "through", "during", "before", "after", "above", "below", "to", "from", "up", "down", "in", "out", "on", "off", "over", "under", "again", "further", "then", "once", "here", "there", "when", "where", "why", "how", "all", "any", "both", "each", "few", "more", "most", "other", "some", "such", "no", "nor", "not", "only", "own", "same", "so", "than", "too", "very", "s", "t", "can", "will", "just", "don", "should", "now"];

function setupMintData(resultObj) {
  let objkt_file = {
    "title": "Upload OBJKT",
    "mimeType": "image/png",
  };
  objkt_file.reader = resultObj.dataUrl;
  objkt_file.buffer = resultObj.buffer;
  objkt_file.file = resultObj.blob;
  let md = resultObj.meta;
  print(resultObj);

  // poor man's sanitation https://stackoverflow.com/a/23453651/1010653
  let tagstr = md["Prompt"].toLowerCase().replace(/[^a-z0-9áéíóúñü \.,_-]/gim,"");
  let wordSplits = tagstr.split(/\s+/);
  // print("wordSplits");
  // console.log(wordSplits);
  let wordSet = new Set(wordSplits);
  // remove stopwords, etc
  stopWords.forEach(Set.prototype.delete, wordSet);
  // print("Wordset");
  // console.log(wordSet);
  let wordArray = Array.from(wordSet);
  // print("wordArray");
  // console.log(wordArray);
  let tags = wordArray.join(",") + ",pixray_genesis"
  // print("tags are " + tags);

  let desc = "Neural network imagery guided by the phrase '" + md["Prompt"] + "' " +
      "created by " + md["Creator"] + " on " + md["Created"] + 
      " using the pixray genesis tool at " + md["Source"];

  let walletStr = getCurrentTzAddress();

  window.tz = window.tz || {};
  window.tz.minting_location = "none";
  window.tz.minting_wallet = walletStr;
  window.tz.mintData = {
    "title": md["Title"],
    "description": desc,
    "tags": tags,
    "royalties": 10,
    "file": objkt_file,
    "mint_fee": 0.01
  }  

  result_is_ready = true;
  updateMintButton();
}

// helper function: blob to dataURL
// https://stackoverflow.com/a/30407959/1010653
function blobToDataURL(blob, callback) {
    var a = new FileReader();
    a.onload = function(e) {callback(e.target.result);}
    a.readAsDataURL(blob);
}

// take the image now on a canvas, add metadata, convert to blob, etc
function prepareImage(p5cb) {
  let img_w = p5cb.img.width;
  let img_h = p5cb.img.height;
  let mint_info = p5cb.mint_info;

  let walletStr = getCurrentTzAddress();
  let showName = walletStr;
  window.tz = window.tz || {};
  if (window.tz.handle != null) {
    showName = window.tz.handle + " (" + walletStr + ")";
  }
  infoUrl = "https://pixray.gob.io/genesis/"
  let dateStr = new Date().toDateString();

  let meta_map = {
      "Title":            mint_info["prompts"] + " (pixray_genesis)",
      "Prompt":           mint_info["prompts"],
      "Settings":         mint_info["settings"],
      "Seed":             mint_info["seed"],
      "Software":         "pixray" + " (" + mint_info["build"] + ")",
      "Creator":          showName,
      "Author":           "dribnet and " + showName,
      "Copyright":        "(c) 2021 Tom White (dribnet)",
      "Source":           infoUrl,
      "Created":          dateStr
    };

  let metadata = {
    "tEXt": meta_map
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
        setupMintData({"dataUrl":dataurl, "blob": newBlob,
                       "buffer": freshUint8View, "meta" : meta_map});
      });
    });
    reader.readAsArrayBuffer(blob);
  }, mimeType);
}

// this method async runs a baby p5.js program to get the image on a canvas
function beginFetchImage(img_src, mint_info) {
  var s = function( p ) {
    p.img = null;

    p.preload = function() {
      // console.log("P PRELOAD START")
      p.img = p.loadImage(img_src);
      // console.log("P PRELOAD END")
    }

    p.setup = function() {
      // console.log("P SETUP " +  p.img.width +","+ p.img.height)
      p.createCanvas(p.img.width, p.img.height);
      p.noLoop();
    };

    p.draw = function() {
      p.background(0);
      p.image(p.img, 0, 0);
      // console.log("P DRAW DONE " +  p.img.width +","+ p.img.height);
      // this is the callback to use the image for minting, etc.
      prepareImage(this);
    }
  }

  let p5cb = new p5(s);
  p5cb.mint_info = mint_info;
  p5cb.redraw();  
}

let result_is_ready = false;
let standby_image = "placeholder.png";
// update UI with either null (if processing) or a URL to a completed image
function refreshResult(new_image, mint_info=null) {
  // let target = document.getElementById("result_img");
  if (new_image == null) {
    result_is_ready = false;
    // target["src"] = standby_image;
    updateMintButton();
  }
  else {
    // target["src"] = new_image;
    // beginFetchImage(standby_image); // <- use this when CORS debugging
    beginFetchImage(new_image, mint_info);
  }
  // console.log("UPDATED TO " + new_image);
}

// update UI when processing starts or stops
function respondToMessage(d) {
  // console.log(d);
  if (!d.hasOwnProperty('name') || (d["name"] != "prediction")) {
    // console.log("NO PREDICTION")
    return;
  }
  if (d["data"]["status"] == "success") {
    // print(d);
    let mint_info = {
      "prompts": "Prompts pending",
      "settings": "Settings pending",
      "seed": "seed pending",
      "build": "build pending"
    }
    refreshResult("https://replicate.ai" + d["data"]["output_file"], mint_info);
  }
  else if (result_is_ready) {
    refreshResult(null);
  }
}

// listen for messages coming from replicate.ai embed
window.addEventListener("message", (event) => {
  respondToMessage(event.data);
})
