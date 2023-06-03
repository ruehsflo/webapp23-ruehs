/**
 * @fileOverview  Auxiliary data management procedures
 * @author Gerd Wagner
 */
import Person from "../m/Person.mjs";
import Movie, { MovieCategoryEL } from "../m/Movie.mjs";
import Director from "../m/Director.mjs";
import Actor from "../m/Actor.mjs";

/*******************************************
 *** Auxiliary methods for testing **********
 ********************************************/
/**
 *  Create and save test data
 */
function generateTestData() {
  try {
    Director.instances["1"] = new Director({
      personId: 1,
      name: "Stephen Frears"
    });
    Director.instances["2"] = new Director({
      personId: 2,
      name: "George Lucas"
    });
    Director.instances["3"] = new Director({
      personId: 3,
      name: "Quentin Tarantino"
    });
    Director.saveAll();
    Actor.instances["17"] = new Actor({
      personId: 17,
      name: "Jack"
    });
    Actor.saveAll();
    Movie.instances["1"] = new Movie({
      movieId: 1,
      title: "Pulp Fiction",
      releaseDate: "1994-05-12",
      actorsIdRef: [3,5,6],
      director_id: 3
    });
    Movie.instances["2"] = new Movie({
      movieId: 2,
      title: "Star Wars",
      releaseDate: "1977-05-25",
      actorsIdRef: [7,8],
      director_id: 2,
      category: MovieCategoryEL.TVSERIESEPISODE,
      tvSeriesName: "Star Wars",
      episodeNo: 2,
    });
    Movie.instances["3"] = new Movie({
      movieId: 3,
      title: "Dangerous Liaisons",
      releaseDate: "1994-05-12",
      actorsIdRef: [9,5],
      director_id: 1,
      category: MovieCategoryEL.BIOGRAPHY,
      about: 1,
    });
    Movie.saveAll();
  } catch (e) {
    console.log( `${e.constructor.name}: ${e.message}`);
  }
}
/**
 * Clear data
 */
function clearData() {
  if (confirm( "Do you really want to delete the entire database?")) {
    try {
      Person.instances = {};
      localStorage["persons"] = "{}";
      Movie.instances = {};
      localStorage["movies"] = "{}";
      console.log("All data cleared.");
    } catch (e) {
      console.log( `${e.constructor.name}: ${e.message}`);
    }
  }
}

export { generateTestData, clearData };
