/**
 * @fileOverview  The model class Movie with attribute definitions and storage management methods
 * @author Gerd Wagner
 * @copyright Copyright � 2013-2014 Gerd Wagner, Chair of Internet Technology, Brandenburg University of Technology, Germany. 
 * @license This code is licensed under The Code Project Open License (CPOL), implying that the code is provided "as-is", 
 * can be modified to create derivative works, can be redistributed, and can be used in commercial applications.
 */

import { cloneObject }
  from "../../lib/util.mjs";
import { NoConstraintViolation, MandatoryValueConstraintViolation, RangeConstraintViolation,
  IntervalConstraintViolation, UniquenessConstraintViolation, StringLengthConstraintViolation }
  from "../../lib/errorTypes.mjs";
import Person from "./Person.mjs";

/**
 * The class Movie
 * @class
 */
class Movie {

  constructor ({movieId, title, releaseDate, director, director_id, actors, actorsIdRef}) {
    // assign default values to mandatory properties
    this.movieId = movieId;   
    this.title = title;  
    this.releaseDate = releaseDate;
    this.director = director || director_id;
    if (actors || actorsIdRef) this.actors = actors || actorsIdRef;
  }

  get movieId(){
    return this._movieId;
  }

  static checkMovieID ( id) {
    if (!Number.isInteger(parseInt( id))) {
      return new RangeConstraintViolation("The movie id must be a positive integer!");
    } else if (id < 0) {
      return new IntervalConstraintViolation("The id must have a postitive value!");
    } else {
      return new NoConstraintViolation();
    }
  }

  static checkMovieIdAsId ( id) {
    var validationResult = Movie.checkMovieID( id);
    if ((validationResult instanceof NoConstraintViolation)) {
      if (!id) {
        validationResult = new MandatoryValueConstraintViolation(
            "A value for the movieID must be provided!");
      } else if (Movie.instances[id]) {  
        validationResult = new UniquenessConstraintViolation(
            "There is already a movie record with this id!");
      } else {
        validationResult = new NoConstraintViolation();
      } 
    }
    return validationResult;
  }

  set movieId ( id) {
    const validationResult = Movie.checkMovieIdAsId( id);
    if (validationResult instanceof NoConstraintViolation) {
      this._movieId = id;
    } else {
      throw validationResult;
    }
  }

  get title() {
    return this._title;
  }

  static checkTitle ( tit) {
    var validationResult = null;
    if (!tit) {
      validationResult = new MandatoryValueConstraintViolation("A title must be provided!");
    } else if (typeof tit !== "string" || tit.trim() === "") {
      validationResult = new RangeConstraintViolation("The title must be a non-empty string!");
    } else if (tit.length > 120) {
      validationResult = new StringLengthConstraintViolation("The title must have at most 120 characters!");
    } else {
      validationResult = new NoConstraintViolation();
    }
    return validationResult;
  }

  set title ( tit) {
    const validationResult = Movie.checkTitle( tit);
    if (validationResult instanceof NoConstraintViolation) {
      this._title = tit;
    } else {
      throw validationResult;
    }
  }

  get releaseDate(){
    return this._releaseDate;
  }

  static checkReleaseDate ( rd){
    const LOWER_BOUND_DATE = new Date("1895-12-28");
    var validationResult = null;
    if (!rd) {
      validationResult = new MandatoryValueConstraintViolation("A releasedate must be provided!");
    } else if ( !Date.parse(rd)) {
      validationResult = new RangeConstraintViolation("The releasedate must be a date in format YYYY-MM-DD!");;
    } else if ((new Date(rd) < LOWER_BOUND_DATE)) {
      validationResult = new IntervalConstraintViolation("The release date has to be later or equal than 1895-12-28!");
    } else {
      validationResult = new NoConstraintViolation();
    }
    return validationResult;
  }

  set releaseDate( rd){
    const validationResult = Movie.checkReleaseDate( rd);
    if (validationResult instanceof NoConstraintViolation) {
      this._releaseDate = rd;
    } else {
      throw validationResult;
    }
  }

  get director() {
    return this._director;
  }


  static checkDirector ( director_id) {
    var validationResult = null;
    if(!director_id){
        validationResult = new MandatoryValueConstraintViolation("A director must be provided");
    } else {
        validationResult = Person.checkPersonIdAsIdRef( director_id);
    }
    return validationResult;
  }

  set director( d){
    if (!d) {  // unset director
        delete this._director.directedMovies[ this._movieId];
        delete this._director;
      } else {
        // d can be an ID reference or an object reference
        const director_id = (typeof d !== "object") ? d : d.personId;
        const validationResult = Movie.checkDirector( director_id);
        if (validationResult instanceof NoConstraintViolation) {
          if( this._director){
            delete this._director.directedMovies[ this._movieId];
          }
          // create the new directorreference
          this._director = Person.instances[ director_id];
          this._director.directedMovies[ this._movieId] = this;
        } else {
          throw validationResult;
        }
      }
  }

  get actors() {
    return this._actors;
  }

  static checkActor( actor_id) {
    var validationResult = null;
    if (!actor_id) {
      // actor(s) are optional
      validationResult = new NoConstraintViolation();
    } else {
      // invoke foreign key constraint check
      validationResult = Person.checkPersonIdAsIdRef( actor_id);
    }
    return validationResult;
  }

  addActor( a) {
    // a can be an ID reference or an object reference
    const actor_id = (typeof a !== "object") ? parseInt( a) : a.personId;
    const validationResult = Movie.checkActor( actor_id);
  
      if (actor_id && validationResult instanceof NoConstraintViolation) {
        // add the new actor reference
        this._actors[actor_id] = Person.instances[actor_id];
        this._actors[actor_id].playedMovies[this._movieId] = this;
      } else {
        throw validationResult;
      }
    
  }
  removeActor( a) {
    // a can be an ID reference or an object reference
    const actor_id = (typeof a !== "object") ? parseInt( a) : a.personId;
    const validationResult = Movie.checkActor( actor_id);
    if (actor_id) {
      if (validationResult instanceof NoConstraintViolation) {
        delete this._actors[actor_id].playedMovies[this._movieId];
        // delete the actor reference
        delete this._actors[String( actor_id)];
      } else {
        throw validationResult;
      }
    }
  }
  set actors( a) {
    this._actors = {};
    if (Array.isArray(a)) {  // array of IdRefs
      for (const idRef of a) {
        this.addActor( idRef);
      }
    } else {  // map of IdRefs to object references
      for (const idRef of Object.keys( a)) {
        this.addActor( a[idRef]);
      }
    }
  }

  /*********************************************************
   ***  Other Instance-Level Methods  ***********************
   **********************************************************/
   toString() {
    var movStr = `Movie{ ID: ${this.movieId}, title: ${this.title}, releaseDate: ${this.releaseDate}, director: ${this.director.toString()}`;
    if (this.actors) movStr += `, actors: ${Object.keys( this.actors).join(",")} }`;
    return `${movStr}`;
  }
  // Convert object to record with ID references
  toJSON() {  // is invoked by JSON.stringify in Movie.saveAll
    var rec = {};
    for (const p of Object.keys( this)) {
      // copy only property slots with underscore prefix
      if (p.charAt(0) !== "_") continue;
      switch (p) {
        case "_director":
          // convert object reference to ID reference
          if (this._director) rec.director_id = this._director.personId;
          break;
        case "_actors":
          // convert the map of object references to a list of ID references
          rec.actorsIdRefs = [];
          for (const actorIdStr of Object.keys( this.actors)) {
            rec.actorsIdRefs.push( parseInt( actorIdStr));
          }
          break;
        default:
          // remove underscore prefix
          rec[p.substr(1)] = this[p];
      }
    }
    return rec;
  }

}
/***********************************************
 ***  Class-level ("static") properties  *******
 ***********************************************/
Movie.instances = {};  // initially an empty collection (a map)
/********************************************************
*** Class-level ("static") storage management methods ***
*********************************************************/
/**
 *  Create a new movie record/object
 */
Movie.add = function (slots) {
    try {
      const movie = new Movie( slots);
      Movie.instances[movie.movieId] = movie;
      console.log(`Movie record ${movie.toString()} created!`);
    } catch (e) {
      console.log(`${e.constructor.name}: ${e.message}`);
    }
  };
  /**
   *  Update an existing Movie record/object
   */
  Movie.update = function ({movieId, title, releaseDate,
      actorsIdRefsToAdd, actorsIdRefsToRemove, director_id}) {
    const movie = Movie.instances[movieId],
          objectBeforeUpdate = cloneObject( movie);
    var noConstraintViolated=true, updatedProperties=[];
    try {
      if (title && movie.title !== title) {
        movie.title = title;
        updatedProperties.push("title");
      }
      if (releaseDate && movie.releaseDate !== new Date( releaseDate)) {
        movie.releaseDate = releaseDate;
        updatedProperties.push("releaseDate");
      }
      if (actorsIdRefsToAdd) {
        updatedProperties.push("actors(added)");
        for (const actorsIdRef of actorsIdRefsToAdd) {
          movie.addActor( actorsIdRef);
        }
      }
      if (actorsIdRefsToRemove) {
        updatedProperties.push("actors(removed)");
        for (const actor_id of actorsIdRefsToRemove) {
          movie.removeActor( actor_id);
        }
      }
      if (director_id &&  movie.director.personId !== director_id) {
        movie.director= director_id;
        updatedProperties.push("director");
      }
    } catch (e) {
      console.log(`${e.constructor.name}: ${e.message}`);
      noConstraintViolated = false;
      // restore object to its state before updating
      Movie.instances[movieId] = objectBeforeUpdate;
    }
    if (noConstraintViolated) {
      if (updatedProperties.length > 0) {
        let ending = updatedProperties.length > 1 ? "ies" : "y";
        console.log(`Propert${ending} ${updatedProperties.toString()} modified for movie ${movieId}`);
      } else {
        console.log(`No property value changed for movie ${movie.movieId}!`);
      }
    }
  };
  /**
   *  Delete an existing Movie record/object
   */
  Movie.destroy = function (movieId) {
    const movie = Movie.instances[movieId];
    if (movie) {
      if(movie.director){
        delete movie.director.directedMovies[movieId];
      }
      /*
      for ( const actorId of Object.keys( movie.actors)){
        delete movie.actors[actorId].playedMovies[movieId];
      }
      */
      console.log(`${Movie.instances[movieId].toString()} deleted!`);
      delete Movie.instances[movieId];
    } else {
      console.log(`There is no movie with ISBN ${movieId} in the database!`);
    }
  };
  /**
   *  Load all movie table rows and convert them to objects 
   *  Precondition: persons must be loaded first
   */
  Movie.retrieveAll = function () {
    var movies = {};
    try {
      if (!localStorage["movies"]) localStorage["movies"] = "{}";
      else {
        movies = JSON.parse( localStorage["movies"]);
        console.log(` movies: ${movies}`);
        console.log(`${Object.keys( movies).length} movie records loaded.`);
      }
    } catch (e) {
      alert( "Error when reading from Local Storage\n" + e);
    }
    for (const movieId of Object.keys( movies)) {
      try {
        Movie.instances[movieId] = new Movie( movies[movieId]);
      } catch (e) {
        console.log(`${e.constructor.name} while deserializing movie ${movieId}: ${e.message}`);
      }
    }
  };
  /**
   *  Save all movie objects
   */
  Movie.saveAll = function () {
    const nmrOfMovies = Object.keys( Movie.instances).length;
    try {
      localStorage["movies"] = JSON.stringify( Movie.instances);
      console.log(`${nmrOfMovies} movie records saved.`);
    } catch (e) {
      alert( "Error when writing to Local Storage\n" + e);
    }
  };

export default Movie;
