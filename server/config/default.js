module.exports={
	appConfig:{
		appName:"pharol-web",
		senecaServices:{
			clientTimeout:6*60*60*1000,
			client:{
				port:11000,
			}
		},
		webAppUrls:[
			"/index",
			"/error"
		]
	}
}
