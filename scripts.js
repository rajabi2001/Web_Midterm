// Web's Midterm Project
// Mohammad Javad Rajabi - 9831025
const errorContainer = document.querySelector("#error_container");
const errorMsg = document.querySelector("#error_msg");
const form = document.querySelector("#form");
const formUsername = document.querySelector("#username");
const profileImage = document.querySelector("#profile_image");
const profileName = document.querySelector("#title_name");
const profileUsername = document.querySelector("#title_username");
const profileLoc = document.querySelector("#title_loc");
const profileBlog = document.querySelector("#title_blog");
const profileDescription = document.querySelector("#description");
const cacheStatus = document.querySelector("#iscached");
const userLangs = document.querySelector("#fav_lang");
const url = "https://api.github.com/users";


// the function that be called when the user press the button
// if data exists in local storage, it'll try to fetch it 
// otherwise it'll fetch from api and then save it in local storage
async function submit(e) {
  e.preventDefault();
  errorContainer.classList.add("gone");
  cacheStatus.textContent = "";

  // username form the input form
  const username = formUsername.value?.trim();
  if (!username) return;

  let data, errorMessage, obj;
  let isCached = true;

  // trying to fetch from cache if it exists
  data = readLocal(username);

  // if data doesn't exist in cache, it'll fetch from the api
  if (!data) {

    isCached = false;
    const response = await getFromApi(username);

    // if connection is disconnected or the user hasn't been found
    if (response.code === 0) {
      data = response.data;
      obj = response.langs
    } else {
      errorMessage = response.message;
    }

    // getting and saving favourite languages
    if (response.code === 0) {
      var language = {}
      for (let i = 0; i < 5 ; i++) {
        if (language[obj[i]['language']] === undefined) {
          language[obj[i]['language']] = 1;
        } else {
          language[obj[i]['language']] += 1;
        }
      }
      var items = Object.keys(language).map((key) => { return [key, language[key]] });
      items.sort((first, second) => { return first[1] - second[1] });
      var keys = items.map((e) => { return e[0] });
      keys = keys.filter(value => {return value !== 'null'});
      data.langs = keys
    }
  }

  // now data is prepared, so we shoud put it into html page
  if (data) {

    //chaching
    const state = isCached ? "got from cache":"";
    cacheStatus.textContent = state;

    // write to cache if it doesn't exist
    if (!isCached) {
      writeLocal(username, data);
    }

    // filling title content
    profileName.textContent = data.name;
    profileUsername.textContent = `@${username}`;
    profileBlog.textContent = data.blog;
    profileLoc.textContent = data.location;

    // photo
    if (!data.avatar_url) profileImage.classList.add("gone");
    else profileImage.classList.remove("gone");
    profileImage.src = data.avatar_url;

    // filling description
    const des = data.bio;
    profileDescription.textContent = des;

    // favourite languages
    keys = data.langs 
    userLangs.textContent = keys ? "Recently used languages: " + keys.join(" , "):"";
    
  } else if (errorMessage){
    errorContainer.classList.remove("gone");
    errorMsg.textContent = errorMessage;
  
  }
}

// reading or getting data from local storage
function readLocal(username) {
  const data = localStorage.getItem(username);
  if (!data) return null;
  return JSON.parse(data);
}

// getting data and information from api 
async function getFromApi(username) {
  try {
    const response = await fetch(`${url}/${username}`);
    if (!response.ok) {
      const msg = (await response.json())?.message;
      throw new Error(msg);
    }
    const resp = await fetch(`${url}/${username}/repos?sort=pushed_at`);
    if (!resp.ok) {
      const msg = (await resp.json())?.message;
      throw new Error(msg);
    }
    return { code: 0, data: await response.json(), langs: await resp.json()};
  } catch (err) {
    let message = "error";
    return { code: 1, message: err.message || message };
  }
}

// writing data from local storage
function writeLocal(username, data) {
  jsonData = JSON.stringify(data);
  localStorage.setItem(username, jsonData);
}


// add an EventListener to submit button
form.addEventListener("submit", submit);
