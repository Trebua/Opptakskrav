window.addEventListener("scroll", checkHeader);

function checkHeader() {
  let scrollPosition = Math.round(window.scrollY);
  if (scrollPosition > 0) {
    document.getElementById("headerContainer").classList.add("sticky");
  } else {
    document.getElementById("headerContainer").classList.remove("sticky");
  }
}
