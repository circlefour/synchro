const socket = io();

const btn = document.getElementById("btn");

function setupDeviceMotionListener() {
  let smoothInt = 0;
  const alpha = 0.1; // smoothing factor (0-1), smaller = smoother

  window.addEventListener("devicemotion", (event) => {
    //console.log('hi wussup');

    const acceleration = event.accelerationIncludingGravity;

    const level = Math.sqrt(
      acceleration.x ** 2 + acceleration.y ** 2 + acceleration.z ** 2
    );

    socket.emit('shake', {x: acceleration.x, y: acceleration.y, z: acceleration.z, avg: level});

    const minAccel = 9.81;
    const maxAccel = 55;

    let intensity = (level - minAccel) / (maxAccel - minAccel);
    intensity = Math.max(0, Math.min(1, intensity));

    // smooth intensity
    smoothInt = smoothInt * (1 - alpha) + intensity * alpha;
    const r = Math.round(255 * smoothInt);
    document.body.style.backgroundColor = `rgb(${r},0,0)`;
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

