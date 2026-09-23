"set strict";
const version = "1.1.0";


let mainBackgroundColor = "";
let playerName = "";
let pingMessage = "Ping!";
let socket;
const title = document.getElementById("title");
const input = document.getElementById("input");
const connectDiv = document.getElementById("connect-div");
const connect = document.getElementById("connect");
const menu = document.getElementById("menu");
const ping = document.getElementById("ping");

connect.addEventListener("click", connectToServer);
menu.addEventListener("click",selectButton);

ping.addEventListener("click",pingPoint);

for(let b of connectDiv.querySelectorAll("button.ipshortcut"))
{
  //console.log(b.textContent + b.value);
  b.addEventListener("click", () => writeAndConnect(b.value));
}

let versionElem = document.createElement("p");
versionElem.style.fontSize = "10pt";
versionElem.append(document.createTextNode("v" + version));
document.body.append(versionElem);

function connectToServer() {
  const address = "ws://" + input.value.trim(); 
  console.log("Connecting to " + address + "...");
  socket = new WebSocket(address); 
  socket.onopen = onOpen;
  socket.onmessage = onMessage;
  socket.onclose = onClose;
  socket.onerror = onError;
  writeMenuTitle("Connecting to " + address + "...");
  showConnectDiv(false);
}

function writeAndConnect(newAddress) {
  input.value = newAddress;
  connectToServer();
}

function onOpen(e) {
  writeMenuTitle("Connected! Please wait for further instructions");
  showConnectDiv(false);
}

function onMessage(e) {
  const messages = event.data.split(">");
  switch (messages[0])
  {
    case "players":
      populatePlayerList(messages);
      break;
    case "items":
      if (playerName != "")
      {
        popuateItems(messages);
      } 
      break;
  }
}

function onClose(e) {
  writeMenuTitle("Oh no! The connection was broken.");
  title.textContent = "Chopping Block Client";
  showConnectDiv(true);
}

function onError(e) {
  writeMenuTitle("Oh no! Something went wrong!");
  title.textContent = "Chopping Block Client";
  showConnectDiv(true);
}

function showConnectDiv(active){
  connectDiv.hidden = !active;
}

function clearMenu() {
  for(let i = menu.childNodes.length - 1; i>=0; i--)
  {
    menu.childNodes[i].remove();
  }
}

function writeMenuTitle(s) {
  clearMenu();
  const header = document.createElement("h2");
  header["align"] = "center";
  header.append(document.createTextNode(s));
  menu.append(header);
}

function populatePlayerList(messages) {
  let index = 0;

  writeMenuTitle("Who are you?");
  for(let i=1; i<messages.length; i+=2)
  {
    let button = document.createElement("li");
    button["player-index"] = index;
    button["player-name"] = messages[i];
    button["player-color"] = messages[i+1];
    let text = document.createTextNode(messages[i]);
    button.append(text);
    menu.append(button);
    index++;
  }
}

function selectButton(event) {
  const button = event.target;
  if (button.nodeName != "LI") return;

  if ("player-index" in button)
  {
    selectPlayer(button);
  }
  if ("item-index" in button)
  {
    selectItem(button);
  }
}

function selectPlayer(button) {
  mainBackgroundColor = button["player-color"];
  document.body.style.backgroundColor = mainBackgroundColor;
  playerName = button["player-name"];
  title.innerHTML = "Welcome " + button["player-name"];
  socket.send("player>" + button["player-index"]);
}

function popuateItems(messages) {
  let index = 0;

  writeMenuTitle("Save an item?");
  for(let i=1; i<messages.length; i++)
  {
    let button = document.createElement("li");
    button["item-index"] = index;
    let text = document.createTextNode(messages[i]);
    button.append(text);
    menu.append(button);
    index++
  }
}

function selectItem(button) {

  if (button["chosen"] == "true")
  {
    button.style.backgroundColor = "";
    button["chosen"] = "false";
    socket.send("save>" + button["item-index"] + ">false");
  } 
  else
  {
    button.style.backgroundColor = "rgba(255,255,255,0.5)";
    button["chosen"] = "true";
    socket.send("save>" + button["item-index"] + ">true"); 
  }
}

function pingPoint(e) {
  const div = e.target;
  const rect = div.getBoundingClientRect();
  const x = 100*(e.clientX - rect.x)/rect.width;
  const y = 100*(e.clientY - rect.y)/rect.height;
  const p = "p>" + Math.trunc(x) + ">" + Math.trunc(y) + ">" + pingMessage;
  console.log(p);
  socket?.send(p);
}

function changeMsg(newMsg) {
  pingMessage = newMsg;
}