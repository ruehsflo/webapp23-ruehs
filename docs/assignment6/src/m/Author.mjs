/**
 * @fileOverview  The model class Author with attribute definitions, (class-level) check methods, 
 *                setter methods, and the special methods saveAll and retrieveAll
 * @author Gerd Wagner
 * @copyright Copyright 2013-2014 Gerd Wagner, Chair of Internet Technology, Brandenburg University of Technology, Germany. 
 * @license This code is licensed under The Code Project Open License (CPOL), implying that the code is provided "as-is", 
 * can be modified to create derivative works, can be redistributed, and can be used in commercial applications.
 */
import Person from "./Person.mjs";
import { cloneObject } from "../../lib/util.mjs";

/**
 * The class Author
 * @class
 */
class Author extends Person {
  // using a single record parameter with ES6 function parameter destructuring
  constructor ({personId, name, biography}) {
    super({personId, name});  // invoke Person constructor
    // assign additional properties
    this.biography = biography;
  }
  get biography() {return this._biography;}
  set biography( b) {this._biography = b;}  /***SIMPLIFIED CODE: no validation ***/
  toString() {
    return `Author{ persID: ${this.personId}, name: ${this.name}, biography: ${this.biography} }`;
  }
}
/*****************************************************
 *** Class-level ("static") properties ***************
 *****************************************************/
// initially an empty collection (in the form of a map)
Author.instances = {};
// add Author to the list of Person subtypes
Person.subtypes.push( Author);

/**********************************************************
 ***  Class-level ("static") storage management methods ***
 **********************************************************/
/**
 *  Create a new author record
 */
Author.add = function (slots) {
  var author = null;
  try {
    author = new Author( slots);
  } catch (e) {
    console.log(`${e.constructor.name + ": " + e.message}`);
    author = null;
  }
  if (author) {
    Author.instances[author.personId] = author;
    console.log(`Saved: ${author.name}`);
  }
};
/**
 *  Update an existing author record
 */
Author.update = function ({personId, name, biography}) {
  const author = Author.instances[personId],
        objectBeforeUpdate = cloneObject( author);
  var noConstraintViolated=true, updatedProperties=[];
  try {
    if (name && author.name !== name) {
      author.name = name;
      updatedProperties.push("name");
    }
    if (biography && author.biography !== biography) {
      author.biography = biography;
      updatedProperties.push("biography");
    }
  } catch (e) {
    console.log( e.constructor.name + ": " + e.message);
    noConstraintViolated = false;
    // restore object to its state before updating
    Author.instances[personId] = objectBeforeUpdate;
  }
  if (noConstraintViolated) {
    if (updatedProperties.length > 0) {
      let ending = updatedProperties.length > 1 ? "ies" : "y";
      console.log(`Propert${ending} ${updatedProperties.toString()} modified for author ${name}`);
    } else {
      console.log(`No property value changed for author ${name}!`);
    }
  }
};
/**
 *  Delete an existing author record
 */
Author.destroy = function (personId) {
  const author = Author.instances[personId];
  delete Author.instances[personId];
  console.log(`Author ${author.name} deleted.`);
};
/**
 *  Retrieve all author objects as records
 */
Author.retrieveAll = function () {
  var authors = {};
  if (!localStorage["authors"]) localStorage["authors"] = "{}";
  try {
    authors = JSON.parse( localStorage["authors"]);
  } catch (e) {
    console.log("Error when reading from Local Storage\n" + e);
  }
  for (const key of Object.keys( authors)) {
    try {  // convert record to (typed) object
      Author.instances[key] = new Author( authors[key]);
      // create superclass extension
      Person.instances[key] = Author.instances[key];
    } catch (e) {
      console.log(`${e.constructor.name} while deserializing author ${key}: ${e.message}`);
    }
  }
  console.log(`${Object.keys( Author.instances).length} Author records loaded.`);
};
/**
 *  Save all author objects as records
 */
Author.saveAll = function () {
  try {
    localStorage["authors"] = JSON.stringify( Author.instances);
    console.log( Object.keys( Author.instances).length +" authors saved.");
  } catch (e) {
    alert("Error when writing to Local Storage\n" + e);
  }
};

export default Author;
