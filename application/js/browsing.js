window.addEventListener('load', function () 
{
  init();
})

var main_container;
var home_view;
var sresult_view;
var rlimit_view;
var two_view;
var loading_view;
var views = [];

var max_sresults = 20;


function init()
{
  main_container = document.getElementById("content-container");
  home_view = document.getElementById("home");
  sresult_view = document.getElementById("sresult");
  rlimit_view = document.getElementById("rlimit");
  two_view = document.getElementById("?2");
  loading_view = document.getElementById("loading");
  views = [home_view, sresult_view, rlimit_view, two_view, loading_view];
  build_home();
}

function hide_views()
{
  for (let view in views)
  {
    views[view].style.display = "none";
  }
}


function build_home()
{
  hide_views();
  home_view.style.display = "block";
}

function build_sresults(data, query)
{
  hide_views();
  sresult_view.style.display = "block";

  // Ratelimit / error with the data
  if(!data)
  {
    build_ratelimit();
    return;
  }

  // Fix anything to do with data length
  let result_count_text = document.getElementById("result-count");
  result_count_text.innerHTML = "Search Results for '" + query + "': (" + data.length + ")";
  if(data.length > max_sresults){data = data.slice(0, max_sresults);} 

  
  // Append sresults
  let el = document.getElementById("sresults-svg").getBoundingClientRect();
  let svg_height = el.height;
  let svg_width = el.width;

  let container = d3.select('#sresults-svg');
  var results = container.selectAll(".resultText")
    .data(data);
  console.log(container);
  results.enter()
    .append("text")
    .attr("x",  10)
    .attr("y", function(d, i) {return (i * ((svg_height - 5) / max_sresults)) + 20})
    .classed("resultText", true);

  results.selectAll("tspan").remove();
  // Textual descriptions
  results.append("tspan").text(function(d, i)
  {return (i+1) + ". ";});
  results.append("tspan").style("fill", "#595f66").text(function(d, i)
  {return d.owner.login + "/";});
  results.append("tspan").style("fill", "#1e2329").text(function(d, i)
  {return d.name;}); 
  results.append("tspan").style("fill", "#1e2329").text(function(d, i)
  {return (d.size/1000) + "MB";}).attr("x", 500);
  results.append("tspan").style("fill", "#1e2329").text(function(d, i)
  {return d.created_at;}).attr("x", 600);
  // Remove excess results based on data
  results.exit().remove();


  // Fade results in
  results
  .style('opacity', 0)
  .transition()
    .duration(function(d,i){return i * 50})
    .style('opacity', 1);

}

function build_ratelimit()
{
  hide_views();
  rlimit_view.style.display = "block";
}

function search(button)
{
  let query = button.closest(".float-right").getElementsByClassName("search-input")[0];
  let value = query.value;
  query.value = "";
  if (!value || value === "")
  {
    return
  }

  hide_views();
  loading_view.style.display = "block";
  // Get results
  fetch('https://api.github.com/search/repositories?q=' + value + '&sort=name&order=desc').then(r => r.json()).then(j => build_sresults(j.items, value));
}