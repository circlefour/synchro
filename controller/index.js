const backend = "https://mobile-interaction.onrender.com";

const socket = io(backend);

const btn = document.getElementById("btn");

function setupDeviceMotionListener() {
  window.addEventListener("devicemotion", (event) => {
    //console.log('hi wussup');

    const acceleration = event.accelerationIncludingGravity;

    // i used to use this, but now i don't really, but i'll keep it for the ui to display how the value is changing, though the visual for changing values should be more intuitive
    const level = Math.sqrt(
      acceleration.x ** 2 + acceleration.y ** 2 + acceleration.z ** 2
    );

    //console.log("shake level: ", level);
    document.getElementById("num").textContent = `${Math.round(level)}`;

    // prior thing
    //socket.emit('shake', level);
    socket.emit('shake', {x: acceleration.x, y: acceleration.y, z: acceleration.z});
  });
}

// check if permission is needed (iOS 13+)
if (
  typeof DeviceMotionEvent !== 'undefined' &&
  typeof DeviceMotionEvent.requestPermission === 'function'
) {

  btn.addEventListener('click', () => {
    DeviceMotionEvent.requestPermission()
      .then(response => {
        if (response === 'granted') {
          setupDeviceMotionListener();
          btn.remove(); // remove button after granting
        } else {
          console.warn('motion permission denied');
        }
      })
      .catch(error => {
        console.error('motion permission error:', error);
      });
  });
} else {
  // no permission required (e.g., android or older iOS)
  setupDeviceMotionListener();
}

