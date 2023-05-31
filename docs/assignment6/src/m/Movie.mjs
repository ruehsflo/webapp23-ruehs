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
import { Enumeration } from "../../lib/Enumeration.mjs";
/**
 * Enumeration type
 * @global
 */
const MovieCategoryEL = new Enumeration(["Biography","TvSeriesEpisode"]);

/**
 * The class Movie
 * @class
 */
class Movie {

  constructor ({movieId, title, releaseDate, director, director_id, actors, actorsIdRef, category, tvSeriesName, episodeNo, about}) {
    // assign default values to mandatory properties
    this.movieId = movieId;   
    this.title = title;  
    this.releaseDate = releaseDate;
    this.director = director || director_id;
    if (actors || actorsIdRef) {
        this.actors = actors || actorsIdRef;
    }
    if (category) { this.category = category};
    if (tvSeriesName) { this.tvSeriesName = tvSeriesName};
    if (episodeNo) { this.episodeNo = episodeNo};
    if (about) { this.about = about};
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
        delete this._director;
      } else {
        // d can be an ID reference or an object reference
        const director_id = (typeof d !== "object") ? d : d.personId;
        const validationResult = Movie.checkDirector( director_id);
        if (validationResult instanceof NoConstraintViolation) {
          // create the new directorreference
          this._director = Person.instances[ director_id];
        } else {
          throw validationResult;
        }
      }
  }

  get actors() {
    return this._actors;
  }

  addActor( a) {
    // a can be an ID reference or an object reference
    const actor_id = (typeof a !== "object") ? parseInt( a) : a.actorId;
    if (actor_id) {
        const key = String( actor_id);
        this._actors[key] = Person.instances[key];
    }
  }
  removeActor( a) {
    // a can be an ID reference or an object reference
    const actor_id = (typeof a !== "object") ? parseInt( a) : a.actorId;
    if (actor_id) {
        // delete the actor reference
        delete this._actors[String( actor_id)];
     
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

  get category (){
    return this._category;
  }

  static checkCategory( c){
    if (c === undefined) {
        return new NoConstraintViolation();  // category is optional
      } else if (!isIntegerOrIntegerString( c) || parseInt( c) < 1 ||
          parseInt( c) > MovieCategoryEL.MAX) {
        return new RangeConstraintViolation(
            `Invalid value for category: ${c}`);
      } else {
        return new NoConstraintViolation();
      }
  }

  set category ( c){
    var validationResult = null;
    if (this.category) {  // already set/assigned
      validationResult = new FrozenValueConstraintViolation(
          "The category cannot be changed!");
    } else {
      validationResult = Movie.checkCategory( c);
    }
    if (validationResult instanceof NoConstraintViolation) {
      this._category = parseInt( c);
    } else {
      throw validationResult;
    }
  }

  get tvSeriesName (){
    return this._tvSeriesName;
  }

  static checkTvSeriesName ( tsn, c){
    const cat = parseInt( c);
    if (cat === MovieCategoryEL.TVSERIESEPISODE && !tsn) {
      return new MandatoryValueConstraintViolation(
          "A tv series name must be provided for a tv series episode!");
    } else if (cat !== MovieCategoryEL.TVSERIESEPISODE && tsn) {
      return new ConstraintViolation("A tv series name must not " +
          "be provided if the movie is not a tv series episode!");
    } else if (tsn && (typeof(tsn) !== "string" || tsn.trim() === "")) {
      return new RangeConstraintViolation(
          "The tv series name must be a non-empty string!");
    } else {
      return new NoConstraintViolation();
    }
  }

  set tvSeriesName ( tsn){
    const validationResult = Movie.checkTvSeriesName(tsn, this.category);
    if (validationResult instanceof NoConstraintViolation) {
        this._tvSeriesName = tsn;
      } else {
        throw validationResult;
      }
  }

  get episodeNo (){
    return this._episodeNo;
  }

  static checkEpisodeNo ( en, c){
    const cat = parseInt( c);
    if (cat === MovieCategoryEL.TVSERIESEPISODE && !en) {
      return new MandatoryValueConstraintViolation(
          "A episode number must be provided for a tv series episode!");
    } else if (cat !== MovieCategoryEL.TVSERIESEPISODE && en) {
      return new ConstraintViolation("A episode number must not " +
          "be provided if the movie is not a tv series episode!");
    } else if (en && !Number.isInteger(parseInt( id))) {
      return new RangeConstraintViolation(
          "The episode number must be a positive integer!");
    } else {
      return new NoConstraintViolation();
    }
  }

  get about (){
    return this._about;
  }

  static checkAbout(about, c){
    const cat = parseInt( c);
    if (cat === MovieCategoryEL.BIOGRAPHY && !about) {
      return new MandatoryValueConstraintViolation(
          "A person must be provided for about!");
    } else if (cat !== MovieCategoryEL.BIOGRAPHY && about) {
      return new ConstraintViolation("An about must not " +
          "be provided if the movie is not a biography!");
    } else {
      return validationResult = Person.checkPersonIdAsIdRef( about);
    }
  }

  set about ( about){
    const validationResult = Movie.checkAbout(about, this.category);
    if (validationResult instanceof NoConstraintViolation) {
        this._about = about;
      } else {
        throw validationResult;
      }
  }

  /*********************************************************
   ***  Other Instance-Level Methods  ***********************
   **********************************************************/
   toString() {
    var movStr = `Movie{ ID: ${this.movieId}, title: ${this.title}, releaseDate: ${this.releaseDate}, director: ${this.director.toString()}`;
    if (this.actors) movStr += `, actors: ${Object.keys( this.actors)} `;
    if (this.tvSeriesName) movStr += `, TvSeriesName: ${this.tvSeriesName} `;
    if (this.episodeNo) movStr += `, Episode Number: ${this.episodeNo} `;
    if (this.about) movStr += `, about: ${this.about} `;
    movStr += `}`;
    return `${movStr}`;
  }
  // Convert object to record with ID references
  toJSON() { // is invoked by JSON.stringify in Book.saveAll
    const rec = {};
    for (const p of Object.keys( this)) {
      // remove underscore prefix
      if (p.charAt(0) === "_") rec[p.substr(1)] = this[p];
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
      if (releaseDate && movie.releaseDate !== parseInt( releaseDate)) {
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
    if (Movie.instances[movieId]) {
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
export { MovieCategoryEL };
