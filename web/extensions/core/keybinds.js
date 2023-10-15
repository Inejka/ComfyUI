import { app } from "../../scripts/app.js";

app.registerExtension({
  name: "Comfy.Keybinds",
  init() {
    const keybindListener = function (event) {
      const modifierPressed = event.ctrlKey || event.metaKey;

      // Queue prompt using ctrl or command + enter
      if (modifierPressed && event.key === "Enter") {
        app.queuePrompt(event.shiftKey ? -1 : 0).then();
        return;
      }

      const target = event.composedPath()[0];
      if (["INPUT", "TEXTAREA"].includes(target.tagName)) {
        return;
      }

      const modifierKeyIdMap = {
        s: "#comfy-save-button",
        o: "#comfy-file-input",
        Backspace: "#comfy-clear-button",
        Delete: "#comfy-clear-button",
        d: "#comfy-load-default-button",
      };

      const modifierKeybindId = modifierKeyIdMap[event.key];
      if (modifierPressed && modifierKeybindId) {
        event.preventDefault();

        const elem = document.querySelector(modifierKeybindId);
        elem.click();
        return;
      }

      // Finished Handling all modifier keybinds, now handle the rest
      if (event.ctrlKey || event.altKey || event.metaKey) {
        return;
      }

      // Close out of modals using escape
      if (event.key === "Escape") {
        const modals = document.querySelectorAll(".comfy-modal");
        const modal = Array.from(modals).find(
          (modal) =>
            window.getComputedStyle(modal).getPropertyValue("display") !==
            "none"
        );
        if (modal) {
          modal.style.display = "none";
        }

        [...document.querySelectorAll("dialog")].forEach((d) => {
          d.close();
        });
      }

      const keyIdMap = {
        q: "#comfy-view-queue-button",
        h: "#comfy-view-history-button",
        r: "#comfy-refresh-button",
      };

      const buttonId = keyIdMap[event.key];
      if (buttonId) {
        const button = document.querySelector(buttonId);
        button.click();
      }

      const alignKeys = ["w", "a", "s", "d"];
      if (alignKeys.includes(event.key)) {
        allignByShortcut(event.key);
      }

      const pinKey = "e";
      if (event.key == pinKey) {
        pinNodes();
      }
    };

    window.addEventListener("keydown", keybindListener, true);
  },
});

function pinNodes() {
  var data = Object.entries(LGraphCanvas.active_canvas.selected_nodes)
    .map((entry) => entry[1])
    .filter((entry) => !entry.flags.pinned);

  var originalLength = Object.entries(
    LGraphCanvas.active_canvas.selected_nodes
  ).length;

  if (data.length == 0 || data.length == originalLength) {
    for (var entry_id in LGraphCanvas.active_canvas.selected_nodes) {
      LGraphCanvas.active_canvas.selected_nodes[entry_id].pin();
    }
  } else {
    for (var entry in data) {
      data[entry].pin();
    }
  }
}

function allignByShortcut(buttonKey) {
  if (Object.entries(LGraphCanvas.active_canvas.selected_nodes).length < 2) {
    return;
  }

  var data = [];
  for (var entry_id in LGraphCanvas.active_canvas.selected_nodes) {
    var entry = LGraphCanvas.active_canvas.selected_nodes[entry_id];
    data.push({
      id: entry_id,
      left: entry.pos[0],
      right: entry.pos[0] + entry.size[0],
      top: entry.pos[1],
      bottom: entry.pos[1] + entry.size[1],
    });
  }

  var keyToAlignSelection = {
    w: (prev, curr) => {
      return prev.top < curr.top ? prev : curr;
    },
    a: (prev, curr) => {
      return prev.left < curr.left ? prev : curr;
    },
    s: (prev, curr) => {
      return prev.bottom > curr.bottom ? prev : curr;
    },
    d: (prev, curr) => {
      return prev.right > curr.right ? prev : curr;
    },
  };
  data = data.reduce(keyToAlignSelection[buttonKey]);
  var keyToCommand = {
    w: "top",
    a: "left",
    s: "bottom",
    d: "right",
  };
  LGraphCanvas.alignNodes(
    LGraphCanvas.active_canvas.selected_nodes,
    keyToCommand[buttonKey],
    LGraphCanvas.active_canvas.selected_nodes[data.id]
  );
}
