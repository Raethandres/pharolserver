"use strict";
const express=require("express");
const config=require("getconfig");
const SpotifyWebApi = require('spotify-web-api-node');
const misc=require("../misc");

const utilities=misc.utilities;
const router=express.Router();

const spotifyApi = new SpotifyWebApi({
	clientId: config.spotify.clientId,
	clientSecret: config.spotify.clientSecret,
	redirectUri: 'http://localhost:8110/webapi/'

  });

  spotifyApi.clientCredentialsGrant()
  .then(function(data) {
    console.log('The access token expires in ' + data.body['expires_in']);
    console.log('The access token is ' + data.body['access_token']);

    // Save the access token so that it's used in future calls
    spotifyApi.setAccessToken(data.body['access_token']);
  }, function(err) {
    console.log('Something went wrong when retrieving an access token', err.message);
  });
	
  
router.route("*")
.all(function(request,response,next){
	utilities.logger(request._parsedUrl.pathname,request.method,"query",request.query,"body",request.body);
	next();
})


router.route("/")
.get(function(request,response,next){
	spotifyApi.getPlaylist('37i9dQZEVXbMDoHDwVN2tF')
	.then(function(data) {
		data=data.body.tracks.items.map(i=>{ return {name:i.track.name,duration:i.track.duration_ms,artist:i.track.artists.map(j=>j.name),release:i.track.album.release_date} })
		response.set("Content-Type","application/json; charset=utf-8");
		response.end(JSON.stringify(data));
	})
	.catch(function(err) {
		if(err.statusCode==401){
			spotifyApi.clientCredentialsGrant()
			.then(function(data) {
			  console.log('The access token expires in ' + data.body['expires_in']);
			  console.log('The access token is ' + data.body['access_token']);
		  
			  // Save the access token so that it's used in future calls
			  spotifyApi.setAccessToken(data.body['access_token']);
			  spotifyApi.getPlaylist('37i9dQZEVXbMDoHDwVN2tF')
				.then(function(data) {
					data=data.body.tracks.items.map(i=>{ return {name:i.track.name,duration:i.track.duration_ms,artist:i.track.artists.map(j=>j.name),release:i.track.album.release_date} })
					response.set("Content-Type","application/json; charset=utf-8");
					response.end(JSON.stringify(data));
				})
				.catch(function(err) {
					utilities.sendError(err,request,response);
				});
			}, function(err) {
			  console.log('Something went wrong when retrieving an access token', err.message);
			});
		}else{
			utilities.sendError(err,request,response);
		}
	});

})




module.exports=router;
