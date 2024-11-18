function expand(element) {
  if (element.querySelector(".option-expand").classList.contains("expanded")) {
    element.querySelector(".option-expand").classList.remove("expanded");
  } else {
    element.querySelector(".option-expand").classList.toggle("expanded");
  }
}

document.querySelectorAll(".expandable").forEach((element) => {
  element.addEventListener("click", () => {
    expand(element);
  });
});
