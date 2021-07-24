window.addEventListener('load', function () 
{
  init();
})

var main_container;
var browsing = "/home";

function init()
{
  main_container = document.getElementById("content-container");
  build_home();
}

function clean_container()
{
  while (main_container.firstChild) 
  {
    main_container.removeChild(main_container.lastChild);
  }
}


function build_home()
{
  clean_container();
  build_browser();
  let div_search = document.createElement("div");
  let h2_search = document.createElement("h2");

  div_search.appendChild(h2_search);
  h2_search.innerHTML = "Search";
  main_container.appendChild(div_search);
}




function build_browser()
{
  let p_browser = document.createElement("p");
  p_browser.id = "browser";
  p_browser.innerHTML = browsing;
  main_container.appendChild(p_browser);
}