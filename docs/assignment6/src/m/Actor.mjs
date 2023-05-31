/**
 * @fileOverview  The model class Actor with attribute definitions, (class-level) check methods, 
 *                setter methods, and the special methods saveAll and retrieveAll
 * @author Gerd Wagner
 * @copyright Copyright 2013-2014 Gerd Wagner, Chair of Internet Technology, Brandenburg University of Technology, Germany. 
 * @license This code is licensed under The Code Project Open License (CPOL), implying that the code is provided "as-is", 
 * can be modified to create derivative works, can be redistributed, and can be used in commercial applications.
 */
import Person from "./Person.mjs";
import { cloneObject } from "../../lib/util.mjs";

/**
 * The class Actor
 * @class
 */
class Actor extends Person {
  // using a single record parameter with ES6 function parameter destructuring
  constructor ({personId, name, agent, agentIdref}) {
    super({personId, name});  // invoke Person constructor
    // assign additional properties
    if (agent || agentIdref) {
        this.agent = agent || agentIdref;
    }
  }
  
  get agent() {
    return this._agent;
  }

  static checkAgent ( agent_id) {
    var validationResult = null;
    if(!director_id){
        validationResult = new MandatoryValueConstraintViolation("An agent must be provided");
    } else {
        validationResult = Person.checkPersonIdAsIdRef( agent_id);
    }
    return validationResult;
  }

  set agent( a){
    if (!a) {  // unset agent
        delete this._agent;
      } else {
        // a can be an ID reference or an object reference
        const agent_id = (typeof a !== "object") ? a : a.personId;
        const validationResult = Person.checkPersonId( agent_id);
        if (validationResult instanceof NoConstraintViolation) {
          // create the new directorreference
          this._agent = Person.instances[ agent_id];
        } else {
          throw validationResult;
        }
      }
  }
  toString() {
    var movStr =  `Actor{ persID: ${this.personId}, name: ${this.name}`;
    if (this.agent) movStr += `, Agent: ${this.agent.toString()} `;

    movStr += `}`;
    return `${movStr}`;
  }
}
/*****************************************************
 *** Class-level ("static") properties ***************
 *****************************************************/
// initially an empty collection (in the form of a map)
Actor.instances = {};
// add Actor to the list of Person subtypes
Person.subtypes.push( Actor);

/**********************************************************
 ***  Class-level ("static") storage management methods ***
 **********************************************************/
/**
 *  Create a new actor record
 */
Actor.add = function (slots) {
  var actor = null;
  try {
    actor = new Actor( slots);
  } catch (e) {
    console.log(`${e.constructor.name + ": " + e.message}`);
    actor = null;
  }
  if (actor) {
    Actor.instances[actor.personId] = actor;
    console.log(`Saved: ${actor.name}`);
  }
};
/**
 *  Update an existing actor record
 */
Actor.update = function ({personId, name, agent}) {
  const actor = Actor.instances[personId],
        objectBeforeUpdate = cloneObject( actor);
  var noConstraintViolated=true, updatedProperties=[];
  try {
    if (name && actor.name !== name) {
      actor.name = name;
      updatedProperties.push("name");
    }
    if (agent && actor.agent !== agent) {
      actor.agent = agent;
      updatedProperties.push("agent");
    }
  } catch (e) {
    console.log( e.constructor.name + ": " + e.message);
    noConstraintViolated = false;
    // restore object to its state before updating
    Actor.instances[personId] = objectBeforeUpdate;
  }
  if (noConstraintViolated) {
    if (updatedProperties.length > 0) {
      let ending = updatedProperties.length > 1 ? "ies" : "y";
      console.log(`Propert${ending} ${updatedProperties.toString()} modified for actor ${name}`);
    } else {
      console.log(`No property value changed for actor ${name}!`);
    }
  }
};
/**
 *  Delete an existing actor record
 */
Actor.destroy = function (personId) {
    for (const key of Object.keys( Movie.instances)) {
        const movie = Movie.instances[key];
        movie.removeActor(personId);
    }
    const actor = Actor.instances[personId];
    delete Actor.instances[personId];
    console.log(`Actor ${actor.name} deleted.`);
};
/**
 *  Retrieve all actor objects as records
 */
Actor.retrieveAll = function () {
  var actors = {};
  if (!localStorage["actors"]) localStorage["actors"] = "{}";
  try {
    actors = JSON.parse( localStorage["actors"]);
  } catch (e) {
    console.log("Error when reading from Local Storage\n" + e);
  }
  for (const key of Object.keys( actors)) {
    try {  // convert record to (typed) object
      Actor.instances[key] = new Actor( actors[key]);
      // create superclass extension
      Person.instances[key] = Actor.instances[key];
    } catch (e) {
      console.log(`${e.constructor.name} while deserializing actor ${key}: ${e.message}`);
    }
  }
  console.log(`${Object.keys( Actor.instances).length} Actor records loaded.`);
};
/**
 *  Save all actor objects as records
 */
Actor.saveAll = function () {
  try {
    localStorage["actors"] = JSON.stringify( Actor.instances);
    console.log( Object.keys( Actor.instances).length +" actors saved.");
  } catch (e) {
    alert("Error when writing to Local Storage\n" + e);
  }
};

export default Actor;
