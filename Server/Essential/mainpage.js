//Functions

function modechange() {
  const mode = document.querySelector('input[name="mode"]:checked').value;
  document
    .querySelectorAll('*[mode]:not([mode="' + mode + '"])')
    .forEach((element) => {
      element.style.display = "none";
    });
  document.querySelectorAll('*[mode="' + mode + '"]').forEach((element) => {
    element.style.display = "unset";
  });
}

function submitform(form, replacecontent, target = "/") {
  if (!window.navigator.onLine) window.location.reload();
  const elm = document.querySelector(replacecontent);
  elm.innerHTML = "";
  const xhr = new XMLHttpRequest();
  const formData = new FormData(form);
  xhr.withCredentials = true;
  xhr.open("POST", target);
  xhr.onreadystatechange = function () {
    if (
      document.querySelector(replacecontent) &&
      this.response !== "" &&
      this.readyState == 4
    ) {
      elm.innerHTML = this.response;
      Array.from(elm.querySelectorAll("script")).forEach((oldScript) => {
        const newScript = document.createElement("script");
        Array.from(oldScript.attributes).forEach((attr) =>
          newScript.setAttribute(attr.name, attr.value)
        );
        newScript.appendChild(document.createTextNode(oldScript.innerHTML));
        oldScript.parentNode.replaceChild(newScript, oldScript);
      });
    }
  };
  xhr.send(formData);
  return false;
}

window.addEventListener("load", () => {
  //Save input

  document.querySelectorAll('input[type="text"], select').forEach((elm) => {
    const v = "routesearch-" + elm.name;
  });

  document
    .querySelectorAll('input[type="checkbox"], checkbox')
    .forEach((elm) => {
      const v = "routesearch-" + elm.name;
      if (sessionStorage.getItem(v)) {
        if (sessionStorage.getItem(v) == "true") elm.checked = true;
        else if (sessionStorage.getItem(v) == "false") elm.checked = false;
        elm.dispatchEvent(new Event("change"));
      }
      elm.addEventListener("change", () => {
        sessionStorage.setItem(v, elm.checked);
      });
    });

  document.querySelectorAll('input[type="radio"]').forEach((elm) => {
    const v = "routesearch-" + elm.name;

    if (sessionStorage.getItem(v)) {
      document
        .querySelectorAll('input[name="' + elm.name + '"]')
        .forEach((elem) => {
          if (elem.value == sessionStorage.getItem(v)) elem.checked = true;
          else elem.checked = false;
        });
      elm.dispatchEvent(new Event("change"));
    }

    elm.addEventListener("change", () => {
      sessionStorage.setItem(
        v,
        document.querySelector('input[name="' + elm.name + '"]:checked').value
      );
    });
  });

  if (sessionStorage.getItem("routesearch-submit"))
    if (sessionStorage.getItem("routesearch-submit") == "submitted")
      submitform(
        document.querySelector("form"),
        ".routeresult",
        "routesearch/index.php"
      );
});

window.addEventListener("pageshow", () => {
  if (!sessionStorage.getItem("loadstate")) location.reload();
  sessionStorage.removeItem("loadstate");
});
