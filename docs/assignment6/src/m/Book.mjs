/**
 * @fileOverview  The model class Book with attribute definitions, (class-level) check methods, 
 *                setter methods, and the special methods saveAll and retrieveAll
 * @author Gerd Wagner
 * @copyright Copyright 2013-2021 Gerd Wagner, Chair of Internet Technology, Brandenburg University of Technology, Germany.
 * @license This code is licensed under The Code Project Open License (CPOL), implying that the code is provided "as-is", 
 * can be modified to create derivative works, can be redistributed, and can be used in commercial applications.
 */
import { cloneObject, isIntegerOrIntegerString } from "../../lib/util.mjs";
import { ConstraintViolation, FrozenValueConstraintViolation, MandatoryValueConstraintViolation,
  NoConstraintViolation, PatternConstraintViolation, RangeConstraintViolation,
  UniquenessConstraintViolation} from "../../lib/errorTypes.mjs";
import { Enumeration } from "../../lib/Enumeration.mjs";
/**
 * Enumeration type
 * @global
 */
const BookCategoryEL = new Enumeration(["Textbook","Biography"]);
/**
 * Constructor function for the class Book 
 * including the incomplete disjoint segmentation {TextBook, Biography}
 * @class
 */
class Book {
  // using a single record parameter with ES6 function parameter destructuring
  constructor ({isbn, title, year, category, subjectArea, about}) {
    this.isbn = isbn;
    this.title = title;
    this.year = year;
    // optional properties
    if (category) this.category = category;  // from BookCategoryEL
    if (subjectArea) this.subjectArea = subjectArea;
    if (about) this.about = about;
  }
  get isbn() {
    return this._isbn;
  }
  static checkIsbn( isbn) {
    if (!isbn) return new NoConstraintViolation();
    else if (typeof isbn !== "string" || isbn.trim() === "") {
      return new RangeConstraintViolation(
          "The ISBN must be a non-empty string!");
    } else if (!/\b\d{9}(\d|X)\b/.test( isbn)) {
      return new PatternConstraintViolation("The ISBN must be "+
          "a 10-digit string or a 9-digit string followed by 'X'!");
    } else {
      return new NoConstraintViolation();
    }
  }
  static checkIsbnAsId( isbn) {
    var validationResult = Book.checkIsbn( isbn);
    if ((validationResult instanceof NoConstraintViolation)) {
      if (!isbn) {
        validationResult = new MandatoryValueConstraintViolation(
            "A value for the ISBN must be provided!");
      } else if (isbn in Book.instances) {
        validationResult = new UniquenessConstraintViolation(
            "There is already a book record with this ISBN!");
      } else {
        validationResult = new NoConstraintViolation();
      }
    }
    return validationResult;
  }
  set isbn( isbn) {
    const validationResult = Book.checkIsbnAsId( isbn);
    if (validationResult instanceof NoConstraintViolation) {
      this._isbn = isbn;
    } else {
      throw validationResult;
    }
  }
  get title() {return this._title;}
  set title( t) {this._title = t;}  //***** SIMPLIFIED CODE: no validation *****
  get year() {return this._year;}
  set year( v) {this._year = v;}  //***** SIMPLIFIED CODE: no validation *****
  get category() {return this._category;}
  static checkCategory( c) {
    if (c === undefined) {
      return new NoConstraintViolation();  // category is optional
    } else if (!isIntegerOrIntegerString( c) || parseInt( c) < 1 ||
        parseInt( c) > BookCategoryEL.MAX) {
      return new RangeConstraintViolation(
          `Invalid value for category: ${c}`);
    } else {
      return new NoConstraintViolation();
    }
  }
  set category( c) {
    var validationResult = null;
    if (this.category) {  // already set/assigned
      validationResult = new FrozenValueConstraintViolation(
          "The category cannot be changed!");
    } else {
      validationResult = Book.checkCategory( c);
    }
    if (validationResult instanceof NoConstraintViolation) {
      this._category = parseInt( c);
    } else {
      throw validationResult;
    }
  }
  get subjectArea() {return this._subjectArea;}
  static checkSubjectArea( sA, c) {
    const cat = parseInt( c);
    if (cat === BookCategoryEL.TEXTBOOK && !sA) {
      return new MandatoryValueConstraintViolation(
          "A subject area must be provided for a textbook!");
    } else if (cat !== BookCategoryEL.TEXTBOOK && sA) {
      return new ConstraintViolation("A subject area must not " +
          "be provided if the book is not a textbook!");
    } else if (sA && (typeof(sA) !== "string" || sA.trim() === "")) {
      return new RangeConstraintViolation(
          "The subject area must be a non-empty string!");
    } else {
      return new NoConstraintViolation();
    }
  }
  set subjectArea( v) {
    const validationResult = Book.checkSubjectArea( v, this.category);
    if (validationResult instanceof NoConstraintViolation) {
      this._subjectArea = v;
    } else {
      throw validationResult;
    }
  }
  get about() {return this._about;}
  static checkAbout( a, c) {
    const cat = parseInt( c);
    //??? if (!cat) cat = BookCategoryEL.BIOGRAPHY;
    if (cat === BookCategoryEL.BIOGRAPHY && !a) {
      return new MandatoryValueConstraintViolation(
          "A biography book record must have an 'about' field!");
    } else if (cat !== BookCategoryEL.BIOGRAPHY && a) {
      return new ConstraintViolation("An 'about' field value must not " +
          "be provided if the book is not a biography!");
    } else if (a && (typeof(a) !== "string" || a.trim() === "")) {
      return new RangeConstraintViolation(
          "The 'about' field value must be a non-empty string!");
    } else {
      return new NoConstraintViolation();
    }
  }
  set about( v) {
    const validationResult = Book.checkAbout( v, this.category);
    if (validationResult instanceof NoConstraintViolation) {
      this._about = v;
    } else {
      throw validationResult;
    }
  }
  /*********************************************************
   ***  Other Instance-Level Methods  ***********************
   **********************************************************/
  toString() {
    var bookStr = `Book{ ISBN: ${this.isbn}, title: ${this.title}, year: ${this.year}`;
    switch (this.category) {
      case BookCategoryEL.TEXTBOOK:
        bookStr += `, textbook subject area: ${this.subjectArea}`;
        break;
      case BookCategoryEL.BIOGRAPHY:
        bookStr += `, biography about: ${this.about}`;
        break;
    }
    return bookStr + "}";
  }
  /* Convert object to record */
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
*** Class-level ("static") properties **********
************************************************/
// initially an empty collection (in the form of a map)
Book.instances = {};

/************************************************
*** Class-level ("static") methods **************
*************************************************/
/**
 * Create a new Book record
 * @method 
 * @static
 * @param {{isbn: string, title: string, year: number, category: ?number, subjectArea: ?string, about: ?string}} slots - A record of parameters.
 */
Book.add = function (slots) {
  var book = null;
  try {
    book = new Book( slots);
  } catch (e) {
    console.log(`${e.constructor.name}: ${e.message}`);
    book = null;
  }
  if (book) {
    Book.instances[book.isbn] = book;
    console.log(`${book.toString()} created!`);
  }
};
/**
 * Update an existing Book record
 * where the slots argument contains the slots to be updated and performing 
 * the updates with setters makes sure that the new values are validated
 * @method 
 * @static
 * @param {{isbn: string, title: string, year: number, category: ?number, subjectArea: ?string, about: ?string}} slots - A record of parameters.
 */
Book.update = function ({isbn, title, year, category, subjectArea, about}) {
  const book = Book.instances[isbn],
        objectBeforeUpdate = cloneObject( book);
  var noConstraintViolated = true, updatedProperties = [];
  try {
    if (title && book.title !== title) {
      book.title = title;
      updatedProperties.push("title");
    }
    if (year && book.year !== year) {
      book.year = year;
      updatedProperties.push("year");
    }
    if (category) {
      if (book.category === undefined) {
        book.category = category;
        updatedProperties.push("category");
      } else if (category !== book.category) {
        throw new FrozenValueConstraintViolation(
            "The book category must not be changed!");
      }
    } else if (category === "" && "category" in book) {
      throw new FrozenValueConstraintViolation(
          "The book category must not be unset!");
    }
    if (subjectArea && book.subjectArea !== subjectArea) {
      book.subjectArea = subjectArea;
      updatedProperties.push("subjectArea");
    }
    if (about && book.about !== about) {
      book.about = about;
      updatedProperties.push("about");
    }
  } catch (e) {
    console.log(`${e.constructor.name}: ${e.message}`);
    noConstraintViolated = false;
    // restore object to its previous state (before updating)
    Book.instances[isbn] = objectBeforeUpdate;
  }
  if (noConstraintViolated) {
    if (updatedProperties.length > 0) {
      let ending = updatedProperties.length > 1 ? "ies" : "y";
      console.log(`Propert${ending} ${updatedProperties.toString()} modified for book ${isbn}`);
    } else {
      console.log(`No property value changed for book ${book.toString()}!`);
    }
  }
};
/**
 * Delete an existing Book record
 * @method 
 * @static
 * @param {string} isbn - The ISBN of a book.
 */
Book.destroy = function (isbn) {
  if (Book.instances[isbn]) {
    console.log(`${Book.instances[isbn].toString()} deleted!`);
    delete Book.instances[isbn];
  } else {
    console.log(`There is no book with ISBN ${isbn} in the database!`);
  }
};
/**
 * Load all book table records and convert them to objects
 * Precondition: publishers and people must be loaded first
 * @method 
 * @static
 */
Book.retrieveAll = function () {
  var books={};
  try {
    if (!localStorage["books"]) localStorage.setItem("books", "{}");
    else {
      books = JSON.parse( localStorage["books"]);
      console.log( Object.keys( books).length +" books loaded.");
    }
  } catch (e) {
    alert("Error when reading from Local Storage\n" + e);
  }
  for (const isbn of Object.keys( books)) {
    Book.instances[isbn] = Book.convertRec2Obj( books[isbn]);
  }
};
/**
 * Convert book record to book object
 * @method 
 * @static
 * @param {{isbn: string, title: string, year: number, category: ?number, subjectArea: ?string, about: ?string}} slots - A record of parameters.
 * @returns {object}
 */
Book.convertRec2Obj = function (bookRow) {
  var book=null;
  try {
    book = new Book( bookRow);
  } catch (e) {
    console.log(`${e.constructor.name} while deserializing a book record: ${e.message}`);
  }
  return book;
};
/**
 * Save all Book objects as records
 * @method 
 * @static
 */
Book.saveAll = function () {
  const nmrOfBooks = Object.keys( Book.instances).length;
  try {
    localStorage["books"] = JSON.stringify( Book.instances);
    console.log(`${nmrOfBooks} book records saved.`);
  } catch (e) {
    alert("Error when writing to Local Storage\n" + e);
  }
};

export default Book;
export { BookCategoryEL };
