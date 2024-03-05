import ChatAPI from "./api/ChatAPI";

export default class Chat {
  constructor(container) {
    this.container = container;
    this.api = new ChatAPI();
    this.websocket = null;
  }

  init() {
    this.bindToDOM();
    this.registerEvents();
  }

  bindToDOM() {
    this.loginModal = this.container.querySelector("#login-modal");
    this.chat = this.container.querySelector("#chat-modal");
  }

  registerEvents() {
    this.loginModal
      .querySelector(".modal__ok")
      .addEventListener("click", (e) => {
        const nickname = this.loginModal.querySelector(".form__input").value;
        this.api.create(nickname).then((response) => {
          this.onEnterChatHandler(response);
        })
        .catch((error) => {
          const errorElement = this.loginModal.querySelector(".form__hint");
          errorElement.textContent = error;
        })
      });
      this.chat.querySelector(".form__input").addEventListener("keydown", (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          this.sendMessage(e.target.value);
          this.chat.querySelector(".form__input").value = "";
        }
      });
  }

  subscribeOnEvents() {
    this.websocket = new WebSocket('wss://backend-sse-ws.onrender.com');
    this.websocket.addEventListener('open', (e) => {
      console.log(e);
    });
    this.websocket.addEventListener('message', (response) => {
      console.log(response);
      const responseData = JSON.parse(response.data);
      if (Array.isArray(responseData)) {
        this.renderUsers(responseData);
      }else{
        this.renderMessage(responseData);
      }
    });
    window.onbeforeunload = () => {
      this.websocket.send(JSON.stringify( {type: "exit", user: this.user} ));
      this.websocket.close();
    };
  }

  onEnterChatHandler(response) {
    this.user = response;
    this.loginModal.classList.add("hidden");
    this.chat.classList.remove("hidden");
    this.subscribeOnEvents();
  }

  sendMessage(message) {
    this.websocket.send(JSON.stringify( {type: "send", user: this.user, message} ));
  }

  renderMessage(responseData) {
    const isCurrentUser = responseData.user.name === this.user.name;
    const messageContainer = this.container.querySelector(".chat__messages-container");
    const dateTime = new Date().toLocaleString();
    const message = `<div class="message__container ${isCurrentUser ? "message__container-yourself": ""}">
                    <div class="message__header">${responseData.user.name}, ${dateTime} </div>
                    <div class="message__content">${responseData.message}</div>
                    </div>`
    messageContainer.innerHTML = messageContainer.innerHTML + message;

  }

  renderUsers(users) {
    const usersList = this.container.querySelector(".chat__userlist");
    const userHTML = users.map((user) => {
      return `<div class="chat__user">${user.name}</div>`
    });
    usersList.innerHTML = userHTML.join("");
    console.log(users);
  }
}
