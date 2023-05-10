/**
 * @fileOverview  The model class Person with property definitions, (class-level) check methods, 
 *                setter methods, and the special methods saveAll and retrieveAll
 * @author Gerd Wagner
 */
import Movie from "./Movie.mjs";
import { cloneObject } from "../../lib/util.mjs";
import { NoConstraintViolation, MandatoryValueConstraintViolation, RangeConstraintViolation,
  UniquenessConstraintViolation, ReferentialIntegrityConstraintViolation }
  from "../../lib/errorTypes.mjs";

/**
 * The class Person
 * @class
 * @param {object} slots - Object creation slots.
 */
class Person {
  // using a single record parameter with ES6 function parameter destructuring
  constructor ({personId, name}) {
    // assign properties by invoking implicit setters
    this.personId = personId;
    this.name = name;
  }
  get personId() {
    return this._personId;
  }
  static checkPersonId( pid) {
    if (!Number.isInteger(parseInt( pid))) {
        return new RangeConstraintViolation("The person id must be a positive integer!");
      } else if (pid < 0) {
        return new IntervalConstraintViolation("The id must have a postitive value!");
      } else {
        return new NoConstraintViolation();
      }
  }
  static checkPersonIdAsId( pid) {
    var validationResult = Person.checkPersonId(pid);
    if ((validationResult instanceof NoConstraintViolation)) {
      if (!pid) {
        return new MandatoryValueConstraintViolation(
            "A person personId is required!");
      } else if (Person.instances[pid]) {
        return new UniquenessConstraintViolation(
            "There is already a person record with this personId!");
      }
    }
    return validationResult;
  }
  static checkPersonIdAsIdRef( pid) {
    var validationResult = Person.checkPersonId( pid);
    if ((validationResult instanceof NoConstraintViolation) && pid) {
      if (!Person.instances[pid]) {
        validationResult = new ReferentialIntegrityConstraintViolation(
          "There is no person record with this personId!");
      }
    }
    return validationResult;
  }
  set personId( pid) {
    var constraintViolation = Person.checkPersonId( pid);
    if (constraintViolation instanceof NoConstraintViolation) {
      this._personId = pid;
    } else {
      throw constraintViolation;
    }
  }
  get name() {
    return this._name;
  }

  static checkName( n) {
    if (!n) {
      return new NoConstraintViolation();  // not mandatory
    } else {
      if (typeof n !== "string" || n.trim() === "") {
        return new RangeConstraintViolation(
		    "The name must be a non-empty string!");
      } else {
        return new NoConstraintViolation();
      }
    }
  }

  set name( n) {
    var constraintViolation = Person.checkName( n);
    if (constraintViolation instanceof NoConstraintViolation) {
      this._name = n;
    } else {
      throw constraintViolation;
    }
  }

  toString() {
    return `Person{ personId: ${this.personId}, name: ${this.name} }`;
  }
  toJSON() {  // is invoked by JSON.stringify
    var rec = {};
    for (const p of Object.keys( this)) {
      // remove underscore prefix
      if (p.charAt(0) === "_") rec[p.substr(1)] = this[p];
    }
    return rec;
  }
}
/***********************************************
*** Class-level ("static") properties **********
************************************************/
// initially an empty collection (in the form of a map)
Person.instances = {};

/****************************************************
*** Class-level ("static") methods ******************
*****************************************************/
/**
 *  Create a new person record/object
 */
Person.add = function (slots) {
  try {
    const person = new Person( slots);
    Person.instances[person.personId] = person;
    console.log(`${person.toString()} created!`);
  } catch (e) {
    console.log(`${e.constructor.personId}: ${e.message}`);
  }
};
/**
 *  Update an existing Person record/object
 */
Person.update = function (slots) {
  const person = Person.instances[slots.personId],
        objectBeforeUpdate = cloneObject( person);
  var noConstraintViolated = true,
      ending = "", updatedProperties = [];
  try {
    if ("name" in slots && person.name !== slots.name) {
      person.name = slots.name;
      updatedProperties.push("name");
    }
  } catch (e) {
    console.log(`${e.constructor.personId}: ${e.message}`);
    noConstraintViolated = false;
    // restore object to its state before updating
    Person.instances[slots.personId] = objectBeforeUpdate;
  }
  if (noConstraintViolated) {
    if (updatedProperties.length > 0) {
      ending = updatedProperties.length > 1 ? "ies" : "y";
      console.log(`Propert${ending} ${updatedProperties.toString()} modified for person ${person.personId}`);
    } else {
      console.log(`No property value changed for person ${person.personId}!`);
    }
  }
};
/**
 *  Delete an existing Person record/object
 */
Person.destroy = function (personId) {
  // delete all references to this person in movie objects
  for (const key of Object.keys( Movie.instances)) {
    const movie = Movie.instances[key];
    if (movie.person?.personId === personId) {  // person is optional
      delete movie._person;  // delete the slot
    }
  }
  // delete the person object
  delete Person.instances[personId];
  console.log(`Person ${personId} deleted.`);
};
/**
 *  Load all person records and convert them to objects
 */
Person.retrieveAll = function () {
  var persons = {};
  if (!localStorage["persons"]) localStorage["persons"] = "{}";
  try {
    persons = JSON.parse( localStorage["persons"]);
  } catch (e) {
    console.log( "Error when reading from Local Storage\n" + e);
    return;
  }
  for (const persName of Object.keys( persons)) {
    try {
      Person.instances[persName] = new Person( persons[persName]);
    } catch (e) {
      console.log(`${e.constructor.personId} while deserializing person ${persName}: ${e.message}`);
    }
  }
  console.log(`${Object.keys( persons).length} person records loaded.`);
};
/**
 *  Save all person objects as rows
 */
Person.saveAll = function () {
  const nmrOfPers = Object.keys( Person.instances).length;
  try {
    localStorage["persons"] = JSON.stringify( Person.instances);
    console.log(`${nmrOfPers} person records saved.`);
  } catch (e) {
    console.error( "Error when writing to Local Storage\n" + e);
  }
};

export default Person;
