async function main() {
  let ws = new WebSocket('ws://localhost:42069');
  ws.addEventListener('message', (msg) => {
    switch (msg.data.trim()) {
      case 'volumeUp': {
        Spicetify.Player.increaseVolume();
        break;
      }
      case 'volumeDown': {
        Spicetify.Player.decreaseVolume();
        break;
      }
      case 'nextSong': {
        Spicetify.Player.next();
        break;
      }
      case 'prevSong': {
        Spicetify.Player.back();
        break;
      }
      case 'togglePlay': {
        Spicetify.Player.togglePlay();
        break;
      }
    }
    console.log(msg.data);
  });

  while (!Spicetify?.showNotification) {
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  // Show message on start.
  Spicetify.showNotification('Hello!');
}

export default main;
