"use strict";

const AWS = require("aws-sdk");
const REGION = process.env.REGION;
const lambda = new AWS.Lambda({region: REGION});

function factory(lammbda){
  return function handler(event,context,callback){
    const functions = event.functions;
    const callEvent = event.event;

    const validMessage = validationMessage(functions, callEvent);

    if(validMessage){
      callback(validMessage);
    }else{
      if(functions.length === 0){
        callback();
      }else{
        const promises = functions.map(f => createPromise(f,callEvent,lammbda));

        Promise.all(promises).then(values => {
          callback(null,values.filter(v => v !== null));
        });
      }
    }
  }
}

function createPromise(functionName,event,lammbda){
  return new Promise((resolve,reject) => {
    const params = {
      FunctionName:functionName,
      Payload:JSON.stringify(event)
    }
    lammbda.invoke(params,function(err,data){
      if(err){
        console.log(err);
        resolve(null);//primise allはfail firstのためrejectしない
      }else{
        if(data.Payload){
          resolve(data.Payload);
        }else{
          resolve(null);
        }
      }
    });
  });
}

function validationMessage(functions,event){
  if(!functions){
    return "invalid params. 'functions' is required";
  }else if(!event){
    return "invalid params, 'event' is required";
  }else if(!Array.isArray(functions)){
    return "invalid params, 'funcstions' should be array";
  }else{
    return null;
  }
}

exports.factory = factory;

exports.handler = factory(lambda);
