var socket = io();
NAF.schemas.getComponentsOriginal = NAF.schemas.getComponents;
NAF.schemas.getComponents = (template) => {
      if (!NAF.schemas.hasTemplate("#avatar-template")) {
            NAF.schemas.add({
                  template: "#avatar-template",
                  components: ["position", "rotation"],
            });
      }
      const components =
            NAF.schemas.getComponentsOriginal(template);
      return components;
};
document.addEventListener("DOMContentLoaded", () => {
      const form = document.querySelector("form"); // form
      const btn = document.querySelector("#send-btn"); // SEND btn
      const input = document.querySelector("#input"); // input field with the text
      const log = document.querySelector(".messages"); // message log
      const username = document.querySelector("#user-name");
      username.value =
            "user-" + Math.round(Math.random() * 10000);
      // when you want to send a message
      form.addEventListener("submit", (evt) => {
            evt.preventDefault();
            // log your own messages
            if (input.value === "") {
                  alert("Please enter a message");
                  return; // Add this line to stop further execution
            } else {
                  log.textContent +=
                        username.value +
                        ": " +
                        input.value +
                        "\n";
            }
            socket.emit("chat message", {
                  txt: input.value,
                  name: username.value,
            });
            // broadcast the text as some unique dataType (like "chat")
            NAF.connection.broadcastDataGuaranteed("chat", {
                  txt: input.value,
                  // Assign the name as username
                  name: username.value,
            });
            // clear the input field
            input.value = "";
            // Scroll to the bottom of the chat
            log.scrollTop = log.scrollHeight;
      });
      // when a "chat" type message arrives
      NAF.connection.subscribeToDataChannel(
            "chat",
            (senderId, dataType, data, targetId) => {
                  // append the data.txt to the message log and data.name as username
                  log.textContent +=
                        data.name + ": " + data.txt + "\n";
                  // Scroll to the bottom of the chat
                  log.scrollTop = log.scrollHeight;
            }
      );
});
// Called by Networked-Aframe when connected to server
function onConnect() {
      console.log("onConnect", new Date());
}
socket.on("color", (data) => {
      const box = document.getElementById(data.el); // Asegúrate de que este selector apunte a tu caja.
      console.log(data.el, box);
      box.setAttribute("material", "color", data.name);
});

// Asegúrate de que este selector apunte a tu caja.
// Esto no es muy eficaz porque no respeta el estado de las físicas
// box.setAttribute('position', data.position);
// console.log('Nueva:' + data.position);
// console.log(data.position);
// puedes acceder a la posición actual del CUERPO FÍSICO.

socket.on("colision", (data) => {
      console.log(data.el);
      const box = document.getElementById(data.el);
      console.log(box);
      // Accediendo al cuerpo físico
      box.body.position.set(
            data.position.x,
            data.position.y,
            data.position.z
      );
});