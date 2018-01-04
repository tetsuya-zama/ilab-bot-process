"use strict";

const AWS = require("aws-sdk");
const REGION = process.env.REGION;
const lambda = new AWS.Lambda({region: REGION});

const TIMEOUT_MILLISEC = 1500;

function factory(lambda){
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
        const promises = functions.map(f => createPromise(f,callEvent,lambda))
          .concat(createTimeOutPromise(TIMEOUT_MILLISEC));

        Promise.race(promises).then(value => {
          callback(null,value);
        }).catch(err =>{
          callback();//全てのfunctionsが結果を返さないもしくはError
        });
      }
    }
  }
}

function createPromise(functionName,event,lambda){
  return new Promise((resolve,reject) => {
    const params = {
      FunctionName:functionName,
      Payload:JSON.stringify(event)
    }

    lambda.invoke(params,function(err,data){
      if(err){
        console.log(err);
        //noop エラーの場合は無視する
      }else{
        if(data.Payload){
          resolve(data.Payload);
        }else{
          //戻り値が無いものも無視する
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

function createTimeOutPromise(timeOutMilliSec){
  return new Promise((resolve,reject)=>{
    setTimeout(()=>reject(),timeOutMilliSec)
  });
}

exports.factory = factory;

exports.handler = factory(lambda);
