window.addEventListener('load', function () 
{
  
  init();
})

var main_container;
var home_view;
var sresult_view;
var rlimit_view;
var repository_view;
var loading_view;
var views = [];

var max_sresults = 20;
var max_sresult_name_length = 35;


function init()
{
  main_container = document.getElementById("content-container");
  home_view = document.getElementById("home");
  sresult_view = document.getElementById("sresult");
  rlimit_view = document.getElementById("rlimit");
  repository_view = document.getElementById("repository");
  loading_view = document.getElementById("loading");
  views = [home_view, sresult_view, rlimit_view, repository_view, loading_view];

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

function build_repository(repo_data)
{
  hide_views();
  repository_view.style.display = "block";
  console.log(repo_data);
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
  result_count_text.innerHTML = "Search Results for '" + query + "': (" + data.length + ")\
  <br><span class='search-notification'>A maximum of " + max_sresults + " results will be shown</span>";
  if(data.length > max_sresults){data = data.slice(0, max_sresults);} 

  
  // Append sresults
  let el = document.getElementById("sresults-svg").getBoundingClientRect();
  let svg_height = el.height;
  let svg_width = el.width;

  let container = d3.select('#sresults-svg');
  let results = container.selectAll(".resultText")
    .data(data);
  
  results.enter()
    .append("text")
    .attr("x",  10)
    .attr("y", function(d, i) {return (i * ((svg_height - 5) / max_sresults)) + 15})
    .classed("resultText", true);
  results.selectAll("tspan").remove();

  results.append("tspan").text(function(d, i)
  {return (i+1) + ". ";});

  results.append("tspan").classed("svg-url-tspan", true).text(function(d, i)
  {return d.owner.login;}).on("click", function(d,i){search_users(d.owner.login);});

  results.append("tspan").classed("svg-tspan", true).text(function(d, i)
  {
    let name = d.name;
    let owner = d.owner.login.length;
    if (name.length + owner > max_sresult_name_length)
    {
      name = name.slice(0, max_sresult_name_length - owner - 3) + '...';
    }
    return "/" + name;
  });

  results.append("tspan").classed("svg-tspan", true).text(function(d, i)
  {return (d.size/1000) + "MB";}).attr("x", 400);

  results.append("tspan").classed("svg-tspan", true).text(function(d, i)
  {
    let date = new Date(d.created_at);
    let year = date.getFullYear();
    let month = date.getMonth()+1;
    let dt = date.getDate();
    return year +'-' + month + '-'+ dt
  }).attr("x", 525);

  results.append("tspan").classed("svg-url-tspan", true).text(function(d, i)
      {return "See repository";}).attr("x", 660)
  .on("click", function(d,i){build_repository(d);});

  results.exit().remove();


  // Add buttons
  let resultButtons = container.selectAll(".resultButton")
    .data(data);
  resultButtons
    .enter()
    .append('svg:image')
      .classed("resultButton", true)
      .attr("x", 635)
      .attr("y", function(d, i) {return (i * ((svg_height - 5) / max_sresults)) + 15 - 17})
      .attr("width", 25)
      .attr("height", 25)
      .attr("xlink:href", "application/files/github_logo.png")
  resultButtons.exit().remove();

  // Fade results in
  results
  .style('opacity', 0)
  .transition()
    .duration(function(d,i){return i * 50})
    .style('opacity', 1);
  resultButtons
  .style('opacity', 0)
  .transition()
    .duration(function(d,i){return i * 50})
    .style('opacity', 1);

}

function show_sresults()
{
  hide_views();
  sresult_view.style.display = "block";
}

function build_ratelimit()
{
  hide_views();
  rlimit_view.style.display = "block";
}

function search_repositories(event, field)
{
  event.preventDefault();
  let value = field.value;
  field.value = "";
  if (!value || value === "")
  {
    return false;
  }


  hide_views();
  loading_view.style.display = "block";
  // Get results
  fetch('https://api.github.com/search/repositories?q=' + value).then(r => r.json()).then(j => build_sresults(j.items, value));
  return false;
}

function search_users(user)
{
  let value = user;
  if (!value || value === "")
  {
    return
  }

  hide_views();
  loading_view.style.display = "block";
  // Get results
  fetch('https://api.github.com/users/'+ value +'/repos').then(r => r.json()).then(j => build_sresults(j, value));
}