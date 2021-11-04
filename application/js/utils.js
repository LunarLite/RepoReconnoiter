// utils.js contains all static functions that serve a more utilitarian purpose.
//
//

// Receives a string and uses regex to check if the string is a valid URL that actually works
function check_valid_url(str) 
{
  var pattern = new RegExp('^(https?:\\/\\/)?'+ // protocol
    '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+ // domain name
    '((\\d{1,3}\\.){3}\\d{1,3}))'+ // OR ip (v4) address
    '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // port and path
    '(\\?[;&a-z\\d%_.~+=-]*)?'+ // query string
    '(\\#[-a-z\\d_]*)?$','i'); // fragment locator
  return !!pattern.test(str);
}


// Receives a textual input which is transformed into a date object and then styles into a proper date string
function create_date_text(input)
{
  let date = new Date(input);
  let text_date = date.getFullYear() +'-' + (date.getMonth()+1) + '-'+ date.getDate();

  return text_date;
}

// Hides all of the views in the visualizer
function hide_views()
{
  for (let view in views)
  {
    views[view].style.display = "none";
  }
}

// Shows the default home view
function show_home()
{
  hide_views();
  home_view.style.display = "block";
  build_history("home");
}

// Shows the view containing all search results
function show_sresults()
{
  hide_views();
  sresult_view.style.display = "block";

  build_history("sresults");
}

// Shows the view containing the chosen repository
function show_repository()
{
  hide_views();
  repository_view.style.display = "block";

  build_history("repository");
}

// Shows the error view
function show_error(issue)
{
  hide_views();
  error_view.style.display = "block";
  let error = document.getElementById("error-text");
  let center = document.createElement("center");
  error.innerHTML = "";
  error.appendChild(center);

  if (typeof issue !== 'undefined') 
  {
    center.innerHTML = issue;
  }
  else
  {
    center.innerHTML = "You were probably ratelimited...";
  }
}

function build_history(last)
{
  let history = document.getElementById("history");
  history.innerHTML = "";
  let curr_history = [];

  let home = document.createElement("a");
  home.onclick = function() {show_home()};
  home.target = '_blank';
  home.innerHTML = "/home";
  curr_history.push(home);

  let sresults = document.createElement("a");
  sresults.onclick = function() {show_sresults()};
  sresults.target = '_blank';
  sresults.innerHTML = "/search_results";

  let repository = document.createElement("a");
  repository.onclick = function() {show_repository()};
  repository.target = '_blank';
  repository.innerHTML = "/repository";

  let graph = document.createElement("a");
  graph.onclick = function() {show_sresults()};
  graph.target = '_blank';
  graph.innerHTML = "/search_results";

  if (['sresults', 'repository', 'graph'].includes(last))
  {
    curr_history.push(sresults);
  }
  if (['repository', 'graph'].includes(last))
  {
    curr_history.push(repository);
  }
  if (['graph'].includes(last))
  {
    curr_history.push(graph);
  }

  for (let i in curr_history)
  {
    history.appendChild(curr_history[i]);  
  }
}
