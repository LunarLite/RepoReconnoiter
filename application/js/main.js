window.addEventListener('load', function () 
{
  init();
})

var main_container;
var home_view;
var sresult_view;
var error_view;
var repository_view;
var graph_view;
var loading_view;
var views = [];

var max_sresults = 20;
var max_sresult_name_length = 35;


function init()
{
  main_container = document.getElementById("content-container");
  home_view = document.getElementById("home");
  sresult_view = document.getElementById("sresult");
  error_view = document.getElementById("error");
  repository_view = document.getElementById("repository");
  loading_view = document.getElementById("loading");
  graph_view = document.getElementById("graph");
  views = [home_view, sresult_view, error_view, repository_view, loading_view, graph_view];

  show_home();
}


function build_sresults(data, query)
{
  show_sresults();

  // Fix anything to do with data length
  let result_count_text = document.getElementById("result-count");
  result_count_text.innerHTML = "<br>Search Results for '" + query + "' :\
  <br><span class='search-notification'>A maximum of " + max_sresults + " results will be shown</span>";
  if(data.length > max_sresults){data = data.slice(0, max_sresults);} 

  
  // Append sresults
  let el = document.getElementById("sresults-svg").getBoundingClientRect();
  let svg_height = el.height;
  let svg_width = el.width;

  let result_container = d3.select('#sresults-svg');
  let results = result_container.selectAll(".resultText")
    .data(data);
  
  results.enter()
    .append("text")
    .attr("x",  10)
    .attr("y", function(d, i) {return (i * ((svg_height - 5) / max_sresults)) + 15})
    .classed("resultText", true);

  results.selectAll("tspan").remove();
  results.append("tspan").text(function(d, i){return (i+1) + ". ";});

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

  results.append("tspan").classed("svg-tspan", true)
    .text(function(d, i){return (d.size/1000) + "MB";}).attr("x", 400);

  results.append("tspan").classed("svg-tspan", true)
    .text(function(d, i){return create_date_text(d.created_at)}).attr("x", 525);

  results.append("tspan").classed("svg-url-tspan", true)
    .text(function(d, i){return "See repository";}).attr("x", 660)
    .on("click", function(d,i){get_repository(d.url);});
  results.exit().remove();


  // Add buttons
  let resultImage = result_container.selectAll(".resultButton")
    .data(data);
  resultImage
    .enter()
    .append('svg:image')
      .classed("resultButton", true)
      .attr("x", 635)
      .attr("y", function(d, i) {return (i * ((svg_height - 5) / max_sresults)) + 15 - 17})
      .attr("width", 25)
      .attr("height", 25)
      .attr("xlink:href", "application/files/github_logo.png")
  resultImage.exit().remove();

  // Fade results in
  results
  .style('opacity', 0)
  .transition()
    .duration(function(d,i){return i * 50})
    .style('opacity', 1);
  resultImage
  .style('opacity', 0)
  .transition()
    .duration(function(d,i){return i * 50})
    .style('opacity', 1);
}

function build_repository(repo_data)
{
  show_repository();

  let repository_title_text = document.getElementById("repository-title");
  repository_title_text.innerHTML = "<br><b>" + repo_data.full_name + "</b>";

  // Prepare working svg
  let el = document.getElementById("repository-svg").getBoundingClientRect();
  let svg_height = el.height;
  let svg_width = el.width;
  let repo_container = d3.select('#repository-svg');
  repo_container.selectAll("*").remove();
  repo_container.append('rect')
    .attr('height', svg_height)
    .attr('width', svg_width)
    .style("fill", "#fae38c");

  // Append all repository data
  let owner = repo_data.owner;
  let avatar_size = 125;
  let desc_max_width = 700;
  let desc_max_height = (avatar_size / 5) * 3;
  let description = repo_data.description;
  if (description == null)
    {description = [{text: "Made by " + repo_data.owner.login}]}
  else
    {description = [{text: description}]}

  let pages_link = repo_data.has_pages;
  let pages_url = "";
  if (pages_link)
  {
    pages_url = "https://" + owner.login + ".github.io/" + repo_data.name + "/";
    if (check_valid_url(pages_url))
    {
      pages_link = "Go to Pages";
    }
    else
    {
      pages_url = "";s
      pages_link = "Has Pages";
    }
  }
  else
  {
    
    pages_link = "No Pages";
  }

  let stat_data = [
      {label: 'Created on 🥚 ', data: create_date_text(repo_data.created_at)},
      {label: 'Last updated on ⌚ ', data: create_date_text(repo_data.updated_at)},
      {label: 'Stars ⭐ ', data: repo_data.watchers},
      {label: 'Watchers 👀 ', data: repo_data.subscribers_count},
      {label: 'Main language 💻 ', data: repo_data.language},
      {label: 'Pages 📖 ', data: pages_link}
    ];

  // Repo avatar
  new d3plus.Circle()
    .data(description)
    .x(avatar_size * 0.30 + avatar_size / 2)
    .y(avatar_size * 0.1 + avatar_size / 2)
    .r(avatar_size / 2)
    .fill('#ffffff')
    .select('#repository-svg')
    .render();

  repo_container.append("defs")
    .append("clipPath")
      .attr("id", "rect-clip")
    .append("rect")
      .attr("id", "my-rect")
      .attr("width", avatar_size)
      .attr("height", avatar_size)
      .attr('x', avatar_size * 0.30)
      .attr('y', avatar_size * 0.1)
      .attr('rx', avatar_size / 2)
      .style('fill-opacity', 0);
  repo_container.append('svg:image')
    .attr('class', 'url-image')
    .attr('height', avatar_size)
    .attr('width', avatar_size)
    .attr('x', avatar_size * 0.30)
    .attr('y', avatar_size * 0.1)
    .attr("xlink:href", owner.avatar_url)
    .attr('clip-path', 'url(#rect-clip)')
    .on("click", function(){window.open(owner.html_url, '_blank');});

  // Repo visualization buttons
  let dim = avatar_size * 1.7
  let graph_pic_data = [
      {src: "application/files/black_square.png", type: repo_data.full_name + " — Commit Graph", data_url: repo_data.commits_url.slice(0, -6)}, 
      {src: "application/files/black_square.png", type: repo_data.full_name + " — Repository CodeFlower", data_url: repo_data.commits_url.slice(0, -6)}, 
      {src: "application/files/black_square.png", type: repo_data.full_name + " — To be decided graph", data_url: repo_data.commits_url.slice(0, -6)}
    ];

  let graph_options = repo_container.selectAll(".graph-option")
    .data(graph_pic_data);
  graph_options.enter()
    .append('svg:image')
    .attr('class', 'url-image graph-option')
    .attr('height', dim)
    .attr('width', dim)
    .attr('x', function(d, i){return avatar_size * 1.60 + (dim * (1.1 * i));})
    .attr('y', avatar_size * 1)
    .attr("xlink:href", function(d){return d.src;})
    .on("click", function(d){return get_graph_data(d.type, d.data_url);});

  // Repo description
  new d3plus.TextBox()
    .data(description)
    .fontSize(16)
    .width(desc_max_width)
    .height(desc_max_height)
    .x(avatar_size * 1.6)
    .y((avatar_size * 0.1) + (avatar_size / 4))
    .select('#repository-svg')
    .render();


  // Repo stats
  let stats = repo_container.selectAll(".stat-text")
    .data(stat_data);
  
  stats.enter()
    .append("text")
    .attr("y", function(d, i) {return (i * ((svg_height - 5) / 20)) + 160})
    .attr("class", function(d) 
      {
        if (d['data'] == "Go to Pages")
        {
          return "stat-text svg-url-tspan";  
        }
        else
        {
          return "stat-text";  
        }
      })
    .on("click", function(d){
      if(d['data'] == "Go to Pages"){window.open(pages_url, '_blank');}});;



  stats.selectAll("tspan").remove();
  stats.append("tspan").style("text-anchor", "end").text(function(d, i){return d.label;}).attr("x", avatar_size * 0.45 + avatar_size / 2);
  stats.append("tspan").text(function(d, i){return d.data;}).attr("x", avatar_size * 0.45 + avatar_size / 2);
}

function build_graph(type, data)
{
  hide_views();
  graph_view.style.display = "block";
  console.log(type);
  console.log(data);

  let graph_title = document.getElementById("graph-title");
  graph_title.innerHTML = "<br><b>" + type + "</b>";
}



