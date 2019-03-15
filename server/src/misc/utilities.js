const config=require("getconfig");
const textColorClose="\033[0m";
const textColorOpenRed="\033[31m";
const textColorOpenGreen="\033[32m";

const consoleErrorRef=console.error;
console.error=function(...params){
	consoleErrorRef.apply(console,[textColorOpenRed+new Date().toISOString()+textColorClose].concat(params));
}

const appError=function(message,statusCode){
	Error.call(this);
	this.message=message;
	this.httpStatusCode=statusCode;
	Error.captureStackTrace(this);
}
appError.prototype.__proto__=Error.prototype;

let selfRef;
class Utilities{
	constructor(){
		selfRef=this;
	}
	
	colorRedText(text){
		return textColorOpenRed+text+textColorClose;
	}
	
	colorGreenText(text){
		return textColorOpenGreen+text+textColorClose;
	}
	
	sendError(error,request,response){
		if(!!error){
			console.error(this.colorRedText("sendError"),request.url,request.method,error instanceof Error,error.toString(),JSON.stringify(request.query),JSON.stringify(request.body),"\n",error);
			response.status(error.httpStatusCode || 500);
			response.end(this.getErrorMessage(error));
		}
	}
	
	getErrorMessage(error){
		if(!!error){
			let message;
			if(typeof error==="string"){
				message=error;
			}else{
				if(error instanceof Error){
					message=error.toString();
				}else{
					message=error.toStringText || error.message || error.errmsg || error.msg || error.error_message || error.name || JSON.stringify(error);
				}
			}
			return message;
		}
	}
	
	destroySession(sessionStore,request,response,next){
		request.logout();
		sessionStore.destroy(request.session.id,function(error){
			if(!!error){
				next(error);
			}else{
				request.session.destroy(function(error){
					if(!!error){
						next(error);
					}else{
						response.clearCookie("user");
						response.clearCookie("session");
						response.end();
					}
				})
			}
		})
	}
	
	sendWebAppMainFile(status,request,response,next){
		const options={root:"/containerapp/public/dist/array",dotfiles:"deny",headers:{}};
		response.status(status).sendFile("index.html",options,function(error){if(!!error) next(error)});
	}
	
	terminateRouting(request,response,next){
		if(response.statusCode===403){
			response.end("403 Forbidden");
		}else if(response.statusCode===401){
			response.end("401 Unauthorized");
		}else{
			if(request.method==="GET"){
				this.sendWebAppMainFile(404,request,response,next);
			}else{
				response.status(405).end("405 Method not allowed");
			}
		}
	}
	
	generateCookieUser(user){
		let cookieUser={};
		cookieUser.name=user.name;
		if(user.profilePicture!=undefined && user.profilePicture.fileSmalll!=undefined) cookieUser.profilePicture={fileSmalll:{url:user.profilePicture.fileSmalll.url}};
		return cookieUser
	}
	
	generateSessionUser(user){
		let sessionUser={
			_id:user._id
		}
		if(user.type!=undefined) sessionUser.type={identifier:user.type.identifier};
		if(user.company!=undefined) sessionUser.company={_id:user.company._id};
		return sessionUser;
	}
	
	appError(message,statusCode){
		return new appError(message,statusCode);
	}
	
	logger(...params){
		if(!config.production){
			console.log(...params);
		}
	}
	
}

module.exports=Utilities;
