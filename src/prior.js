"use strict";

const AWS = require("aws-sdk");
const lambda = new AWS.Lambda();

function factory(lambda){
  return function handler(event,context,callback){
    const functions = event.functions;
    const callEvent = event.event;

    const validMessage = validationMessage(functions,callEvent);

    if(validMessage){
      callback(validMessage);
    }else{

      if(functions.length === 0){
        callback();
      }else{
        const promises = functions.map(f => createPromise(f,callEvent,lambda));

        Promise.all(promises).then(values => {
          const notNullValues = values.filter(v => v !== null);

          if(notNullValues.length === 0){
            callback();
          }else{
            const mostPriorValue = notNullValues.sort((a,b) => a.priority - b.priority)[0].value;
            callback(null,mostPriorValue);
          }
        });
      }
    }
  }
}

function validationMessage(functions,event){
  if(!functions){
    return "invalid params. 'functions' is required";
  }else if(!event){
    return "invalid params, 'event' is required";
  }else if(!Array.isArray(functions)){
    return "invalid params, 'funcstions' should be array";
  }else if(!functions.every(v => v.name && v.priority)){
    return "invalid params ,every values of 'functions' must have 'name' and 'priority' attributes";
  }else if(!functions.every(v => isFinite(v.priority))){
    return "invalid params ,every priority must be a number";
  }else{
    return null;
  }
}

function createPromise(functionData,event,lambda){
  return new Promise((resolve,reject)=>{
    const params = {
      FunctionName:functionData.name,
      Payload:JSON.stringify(event)
    }

    lambda.invoke(params,function(err,data){
      if(err){
        console.log(err);
        resolve(null);
      }else{
        if(data.Payload){
          resolve({value:data.Payload,priority:functionData.priority});
        }else{
          resolve(null);
        }
      }
    });
  });
}

exports.factory = factory;

exports.handler = factory(lambda);
