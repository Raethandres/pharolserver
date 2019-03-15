"use strict";
const cluster=require("cluster");
const config=require("getconfig");
const misc=require("./src/misc");

process.title="pharolweb";

const utilities=misc.utilities;

process.on("unhandledRejection",function(reason,promise){
	console.log(utilities.colorRedText("process.unhandledRejection"),"id",process.pid,"\n",reason,promise);
	throw reason;
})
process.on("uncaughtException",function(error){
	console.error(utilities.colorRedText("process.uncaughtException"),"id",process.pid,"\n",error);
	process.exit(1);
})

const start=function(){
	const ip=require("ip");
	
	const httpServer=require("./src/httpserver.js");
	
}

if(cluster.isMaster){
	const os=require("os");
	
	const date=new Date();
	console.log("currentDate",date.toString(),"currentDateUTC",date.toUTCString());
	console.log(
		"networkInterfaces",os.networkInterfaces(),
		"\nenv",process.env,
		"\nrelease",process.release,
		"\nversions",process.versions,
		"\nserverconfig",config,
		"\n__dirname",__dirname,
		"\ncpus",os.cpus().length,os.cpus().map(function(element,index,array){return element.model}),
		"\ntotalmem",os.totalmem(),
		"\nfreemem",os.freemem(),
		"\ntype",os.type(),
		"\narchitecture",process.arch,
		"\nplatform",process.platform,
		"\nprocess pid",process.pid
	)
	
	cluster.setupMaster({});
	console.log("cluster.settings",cluster.settings);
	
	let terminationTime=false;
	const terminate=function(){
		console.log(utilities.colorRedText("TERMINATING"));
		terminationTime=true;
		for(let id in cluster.workers) if(cluster.workers.hasOwnProperty(id)) process.kill(cluster.workers[id].process.pid,"SIGTERM");
		setTimeout(function(){
			cluster.disconnect(function(){
				console.log(utilities.colorRedText("cluster.disconnect"));
				process.exit(1);
			})
		},5000)
	}
	process.on("SIGTERM",terminate);
	
	const numberOfWorkers=config.numberOfWorkers || os.cpus().length || 2;
	
	const workerError=function(error){console.error(utilities.colorRedText("worker.error"),"worker",this.id,process.pid,"\n",error)};
	
	for(let i=0; i<numberOfWorkers; i++){
		setTimeout(function(){
			const worker=cluster.fork().on("error",workerError.bind(this));
		},i*30*1000)
	}
	//start();
	cluster.on("exit",function(worker,code,signal){
		console.log(utilities.colorRedText(process.title+" cluster.exit"),"worker",worker.id,worker.process.pid,"code",code,"signal",signal);
		if(!terminationTime){
			const worker=cluster.fork().on("error",workerError.bind(this));
		}
	})
	cluster.on("disconnect",function(worker){
		console.log(utilities.colorRedText(process.title+" cluster.disconnect"),"worker",worker.id,worker.process.pid);
		if(!terminationTime){
			worker.kill("SIGTERM");
		}
	})
	cluster.on("fork",function(worker){
		console.log(process.title,"cluster.fork",worker.id,worker.process.pid);
	})
	cluster.on("online",function(worker){
		console.log(process.title,"cluster.online",worker.id,worker.process.pid);
	})
	cluster.on("listening",function(worker,address){
		console.log(utilities.colorGreenText(process.title+" cluster.listening"),"address",address,"worker",worker.id,worker.process.pid);
	})
}else if(cluster.isWorker){
	start();
}
