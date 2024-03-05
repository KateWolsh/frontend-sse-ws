import Entity from "./Entity";
import createRequest from "./createRequest";

export default class ChatAPI {
  create(nickname) {
    return createRequest({
      method: "POST",
      endpoint: "new-user",
      body: { name: nickname },
    }).then((response) => {
      if (response.status === "ok") {
        return response.user;
      } else if (response.status === "error") {
        throw new Error(response.message);
      }
    });
  }
}
