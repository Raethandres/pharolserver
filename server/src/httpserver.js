"use strict";
const http=require("http");
const express=require("express");
const bodyParser=require("body-parser");
const cookieParser=require("cookie-parser");
const compression=require("compression");
const config=require("getconfig");
const expressEnforcesSsl=require("express-enforces-ssl");
const prerender=require("prerender-node");
const routes=require("./routes");
const misc=require("./misc");

// prerender.set("prerenderServiceUrl",config.prerender.url);
// prerender.set("prerenderServerRequestOptions",{headers:{"Authorization":"Basic "+Buffer.from(config.prerender.username+":"+config.prerender.password).toString("base64")}});
// prerender.crawlerUserAgents.push("googlebot");
// prerender.crawlerUserAgents.push("bingbot");
// prerender.crawlerUserAgents.push("yahoo");
// prerender.crawlerUserAgents.push("validator.nu");
// prerender.set("beforeRender",function(request,callback){
// 	callback();
// })
// prerender.set("afterRender",function(error,request,prerenderResponse){
	
// })

const utilities=misc.utilities;

const terminusShutdown=function(){console.log(utilities.colorRedText("terminus.onShutdown"))};

const app=express();
const port=config.webServer.endpointPort;
const httpServer=http.createServer(app);
// createTerminus(httpServer,{logger:console.log,onShutdown:terminusShutdown,signal:"SIGTERM"});
httpServer.on("listening",function(){console.log(utilities.colorGreenText(process.title+" server.listening"),"port",port)});
httpServer.on("error",function(error){
	console.error(utilities.colorRedText("httpServer.error"),"\n",error);
	httpServer.close();
})
httpServer.on("connection",function(socket){utilities.logger("httpServer.connection",socket.remoteAddress,socket.remotePort,socket.remoteFamily)});
httpServer.on("close",function(){console.log("httpServer.close",arguments)});
httpServer.on("clientError",function(error,socket){console.error(utilities.colorRedText("httpServer.clientError"),"\n",error,socket.remoteAddress,socket.remotePort,socket.remoteFamily)});
httpServer.on("connect",function(request,socket,head){console.log("httpServer.connect",socket.remoteAddress)});
httpServer.listen(port);

// app.use(prerender);


const verifyBody=function(request,response,buffer,encoding){request.rawBody=buffer};

app.disable("x-powered-by");
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json({strict:false,verify:verifyBody}));
app.use(cookieParser());


if(config.production){
	app.enable("trust proxy");
	app.use(expressEnforcesSsl());
	//app.use(helmet.hsts({maxAge:config.webServer.expressSessionTime,preload:true}));
}



const checkRequest=function(request,response,next){
	response.set("Access-Control-Allow-Origin",request.headers["origin"] || request.headers["Origin"]);
	response.set("Cache-Control","no-cache, must-revalidate");
	response.set("Content-Type","text/html; charset=utf-8");
	if(request.method==="GET"){
		if(request._parsedUrl.pathname==="/") utilities.sendWebAppMainFile(200,request,response,next);
		else if(config.appConfig.webAppUrls.some(function(element,index,array){return element===request._parsedUrl.pathname || (element+"/")===request._parsedUrl.pathname})) utilities.sendWebAppMainFile(200,request,response,next);
		else{
			next();
		}
	}else{
		next();
	}
}
app.use(function(request,response,next){
	// utilities.logger(request._parsedUrl.pathname,request.method,"query",request.query,"body",request.body,"user",request.user);//,"request.headers",request.headers,"cookies",Object.keys(request.cookies),"request.ip",request.ip,request.ips,"request.protocol",request.protocol,"x-forwarded-proto",request.headers["x-forwarded-proto"],"x-forwarded-for",request.headers["x-forwarded-for"]
	response.on("error",function(error){console.error(utilities.colorRedText("response.error"),error,response.socket.remoteAddress,request._parsedUrl.pathname,request.method)});
	if(request.user!=undefined){
		if(request.cookies.session==undefined || request.cookies.user==undefined){
			utilities.destroySession(sessionStore,request,response,next);
		}else{
			response.cookie("user",request.cookies.user,config.webServer.cookieConfig);
			checkRequest(request,response,next);
		}
	}else{
		response.clearCookie("user");
		response.clearCookie("session");
		checkRequest(request,response,next);
	}
})

app.route("/")
.get(function(request,response,next){
	response.end("welcome");
});

app.use("/webapi",routes.webapi);

app.use(function(error,request,response,next){
	utilities.sendError(error,request,response);
})

app.use(compression({
	level:9,memLevel:9,filter:function(request,response){
		if(!!request.query.download) return false;
		else return true;
	}
}))



app.route("*")
.get(function(request,response,next){
	console.log("app.route(*)",request.url,request.method,"response.statusCode",response.statusCode,"user",request.user,request.headers["user-agent"]);
	utilities.terminateRouting(request,response,next);
})
.post(function(request,response,next){
	console.log("app.route(*)",request.url,request.method,"response.statusCode",response.statusCode,"user",request.user,request.headers["user-agent"]);
	utilities.terminateRouting(request,response,next);
})
.put(function(request,response,next){
	console.log("app.route(*)",request.url,request.method,"response.statusCode",response.statusCode,"user",request.user,request.headers["user-agent"]);
	utilities.terminateRouting(request,response,next);
})
.delete(function(request,response,next){
	console.log("app.route(*)",request.url,request.method,"response.statusCode",response.statusCode,"user",request.user,request.headers["user-agent"]);
	utilities.terminateRouting(request,response,next);
})
.options(function(request,response,next){
	response.set("Access-Control-Allow-Methods","HEAD,GET,POST,PUT,DELETE,OPTIONS");
	response.set("Allow","HEAD,GET,POST,PUT,DELETE,OPTIONS");
	response.set("Access-Control-Max-Age","1728000");//20dias
	response.end();
})
