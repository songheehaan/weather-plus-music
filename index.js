const axios = require("axios");
const publicIp = require("public-ip");
const DarkSky = require("dark-sky");
const SpotifyWebApi = require("spotify-web-api-node");

//Get the weather with the ip address.
const getWeatherWithIp = async () => {
  const ip = await publicIp.v4();
  const ipInfo = await axios.get(`https://ipapi.co/${ip}/json`);
  const res = await axios.get(
    `https://api.darksky.net/forecast/yourtoken/${ipInfo.data.latitude},${
      ipInfo.data.longitude
    }?units=auto`
  );
  const weatherInfo = `${ipInfo.data.city} is currently ${
    res.data.currently.summary
  } and ${res.data.currently.temperature} degrees`;
  let icon = res.data.currently.icon;

  const cloudy = ["partly-cloudy-day", "partly-cloudy-night", "fog"];
  const clear = ["clear-day", "clear-night"];

  //divide the weather into 5 categories (rain, snow, clear, wind, cloudy)
  if (icon == "sleet") {
    icon = "snow";
  } else if (cloudy.includes(icon)) {
    icon = "cloudy";
  } else if (clear.includes(icon)) {
    icon = "clear";
  }
  const weatherReturn = [icon, weatherInfo];
  return weatherReturn;
};

// Assign the playlist according to the weather catagory.
const sIdMap={rain:'37i9dQZF1DXbvABJXBIyiY',snow:'37i9dQZF1DXd7ukl5yRLE3',clear:'37i9dQZF1DX1BzILRveYHb',
wind:'37i9dQZF1DWYYeI1QdFxzU',cloudy:'06Y0QSTQucnveI75usZ5Ki'}

/*
const getSId = icon => {
  let sId = "";
  switch (icon) {
    case "rain":
      sId = "37i9dQZF1DXbvABJXBIyiY";
      break;
    case "snow":
      sId = "37i9dQZF1DXd7ukl5yRLE3";
      break;
    case "clear":
      sId = "37i9dQZF1DX1BzILRveYHb";
      break;
    case "wind":
      sId = "37i9dQZF1DWYYeI1QdFxzU";
      break;
    case "cloudy":
      sId = "06Y0QSTQucnveI75usZ5Ki";
      break;
    default:
      sId = "cannot find the playlist";
  }
  return sId;
}; */

const spotifyApi;

//Get a track's external url from the playlist
const getExternalUrl = async sId => {
  //authentication
  spotifyApi = new SpotifyWebApi({
    clientId: "your client id", 
    clientSecret: "your client secret" 
  });
  const accessTokenObj = await spotifyApi.clientCredentialsGrant();
  spotifyApi.setAccessToken(accessTokenObj.body["access_token"]);

  const trackObj = await spotifyApi.getPlaylistTracks("Spotify", sId);
  const tObjLength = await trackObj.body.items.length;

  // Use random number to choose a track in the playlist.
  const randomTrack = Math.floor(Math.random() * tObjLength + 1);
  const externalUrl =
    trackObj.body.items[randomTrack].track.external_urls.spotify;
  return externalUrl;
};

const main = async () => {
  try {
    const weatherResult = await getWeatherWithIp();
    const sId = sIdMap[weatherResult[0]];
    //const sId = await getSId(weatherResult[0]);
    const externalUrl = await getExternalUrl(sId);
    console.log("Weather : " + weatherResult[1]);
    console.log("Track's External Url : " + externalUrl);
  } catch (err) {
    console.error("fix the " + err);
  }
};

main();
