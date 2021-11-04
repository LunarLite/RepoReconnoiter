// api_calls.js contains all functions that in some way fetch data from github
//
//

// Receives a string containing the name of a user and then returns up to 20 repositories owned by that user
function search_users(user)
{
  hide_views();
  loading_view.style.display = "block";
  // Get results
  fetch('https://api.github.com/users/'+ user +'/repos?per_page=20')
    .then(res => 
      {
        let [status, status_text] = response_check(res);
        if (!res.ok)
        {
          show_error(status_text);
          return;
        }
        res.json().then(function(data)
        {
          if(!data)
          {
            show_error();
            return;
          }
          else
          {
            build_sresults(data, user);
          }
        });
      });
}

// Receives field.value and returns up to 20 repositories of which the name matches
function search_repositories(event, field)
{
  event.preventDefault();
  let value = field.value;
  field.value = "";
  if (!value || value === "")
  {
    return;
  }

  hide_views();
  loading_view.style.display = "block";
  // Get results
  fetch('https://api.github.com/search/repositories?q=' + value + "&per_page=20")
    .then(res => res.json())
    .then(json => json.items)
    .then(function(data)
    {
      if(!data)
      {
        show_error();
        return;
      }
      else
      {
        build_sresults(data, value);
      }
    });
}

// Uses the received GET url to fetch a specific repository
function get_repository(url)
{
  hide_views();
  loading_view.style.display = "block";
  // Get results
  fetch(url)
    .then(res => res.json())
    .then(function(data)
    {
      if(!data)
      {
        show_error();
      }
      else if(!data.owner)
      {
        show_error("There was an issue with this repository");
      }
      else
      {
        build_repository(data);
      }
    });
}


// 
function get_graph_data(type, url)
{
  hide_views();
  loading_view.style.display = "block";
  // Get results
  fetch(url+"?per_page=100")
    .then(res => res.json())
    .then(function(data)
    {
      if(!data)
      {
        show_error();
        return;
      }
      else
      {
        build_graph(type, data);
      }
    });
}


function response_check(response)
{
  console.log(response);
  let status_text = "";
  if (response.status == 403)
  {
    status_text = "You were ratelimited!";
  }

  return [response.status, status_text];
}