(() => {
  // Others
  const alertId = 'message-display'


  // The width and height of the captured photo. We will set the
  // width to the value defined here, but the height will be
  // calculated based on the aspect ratio of the input stream.

  const width = 320; // We will scale the photo width to this
  let height = 0; // This will be computed based on the input stream

  // |streaming| indicates whether or not we're currently streaming
  // video from the camera. Obviously, we start at false.

  let streaming = false;

  // The various HTML elements we need to configure or control. These
  // will be set by the startup() function.

  let video = null;
  let canvas = null;
  let startbutton = null;

  function showViewLiveResultButton() {
    if (window.self !== window.top) {
      // Ensure that if our document is in a frame, we get the user
      // to first open it in its own tab or window. Otherwise, it
      // won't be able to request permission for camera access.
      document.querySelector(".contentarea").remove();
      const button = document.createElement("button");
      button.textContent = "View live result of the example code above";
      document.body.append(button);
      button.addEventListener("click", () => window.open(location.href));
      return true;
    }
    return false;
  }

  function startup() {
    if (showViewLiveResultButton()) {
      return;
    }
    video = document.getElementById("video");
    canvas = document.getElementById("canvas");
    startbutton = document.getElementById("startbutton");

    navigator.mediaDevices
      .getUserMedia({ video: true, audio: false })
      .then((stream) => {
        video.srcObject = stream;
        video.play();
      })
      .catch((err) => {
        console.error(`An error occurred: ${err}`);
      });

    video.addEventListener(
      "canplay",
      (ev) => {
        if (!streaming) {
          height = video.videoHeight / (video.videoWidth / width);

          // Firefox currently has a bug where the height can't be read from
          // the video, so we will make assumptions if this happens.

          if (isNaN(height)) {
            height = width / (4 / 3);
          }

          video.setAttribute("width", width);
          video.setAttribute("height", height);
          canvas.setAttribute("width", width);
          canvas.setAttribute("height", height);
          streaming = true;
        }
      },
      false
    );

    startbutton.addEventListener(
      "click",
      (ev) => {
        takepicture();
        ev.preventDefault();
      },
      false
    );
  }

  // Capture a photo by fetching the current contents of the video
  // and drawing it into a canvas, then converting that to a PNG
  // format data URL. By drawing it on an offscreen canvas and then
  // drawing that to the screen, we can change its size and/or apply
  // other changes before drawing it.

  function takepicture() {
    const context = canvas.getContext("2d");
    if (width && height) {
      canvas.width = width;
      canvas.height = height;
      context.drawImage(video, 0, 0, width, height);

      const photoData = canvas.toDataURL("image/png");

      const formData = new FormData();
      formData.append("photo", photoData);

      fetch("/person-picture", {
        method: "POST",
        body: formData
      })
      .then(async response => {
        console.log(response);
        let data = await response.json()
        if (response && response.status == 403) {
          //alert(`Persona no identificada. Mensaje del servidor: ${data.message}. Por favor intente de nuevo.`)
          AlertSetText(alertId, `Persona no identificada. Mensaje del servidor: ${data.message}. Por favor intente de nuevo.`)
          AlertSetState(alertId, 'error')
          AlertShow(alertId)
        } else if (response && response.status == 200) {
          //alert(`Hola, ${data.person}.`)
          AlertSetText(alertId, `Hola, ${data.person}.`)
          AlertSetState(alertId, 'success')
          AlertShow(alertId)
        }
      })
      .then(() => {
        console.log("La foto fue enviada correctamente");
      });
      AlertSetText(alertId, 'Esperando respuesta.')
      AlertSetState(alertId, 'info')
      AlertShow(alertId)
    }
  }

  // Set up our event listener to run the startup process
  // once loading is complete.
  window.addEventListener("load", startup, false);

  //Set up view alerts
  AlertHide(alertId)
})();
