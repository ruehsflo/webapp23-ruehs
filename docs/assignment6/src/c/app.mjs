/**
 * @fileOverview  App-level controller code
 * @author Gerd Wagner
 */
import Person from "../m/Person.mjs";
import Author from "../m/Author.mjs";
import Employee, { EmployeeCategoryEL } from "../m/Employee.mjs";
import Book, { BookCategoryEL } from "../m/Book.mjs";

/*******************************************
 *** Auxiliary methods for testing **********
 ********************************************/
/**
 *  Create and save test data
 */
function generateTestData() {
  try {
    Book.instances["0553345842"] = new Book({
      isbn: "0553345842",
      title: "The Mind's I",
      year: 1982
    });
    Book.instances["1463794762"] = new Book({
      isbn: "1463794762",
      title: "The Critique of Pure Reason",
      year: 2011
    });
    Book.instances["0631232826"] = new Book({
      isbn: "0631232826",
      title: "Kant",
      year: 2001,
      category: BookCategoryEL.TEXTBOOK,
      subjectArea: "Philosophy"
    });
    Book.instances["0300029829"] = new Book({
      isbn: "0300029829",
      title: "Kant's Life and Thoughts",
      year: 1983,
      category: BookCategoryEL.BIOGRAPHY,
      about: "Immanuel Kant"
    });
    Book.saveAll();
    Employee.instances["1001"] = new Employee({
      personId: 1001,
      name: "Harry Wagner",
      empNo: 21035
    });
    Employee.instances["1002"] = new Employee({
      personId: 1002,
      name: "Peter Boss",
      empNo: 23107,
      category: EmployeeCategoryEL.MANAGER,
      department: "Marketing"});
    Employee.saveAll();
    Author.instances["1001"] = new Author({
      personId: 1001,
      name: "Harry Wagner",
      biography: "Born in Boston, MA, in 1956, ..."
    });
    Author.instances["1077"] = new Author({
      personId: 1077,
      name: "Immanuel Kant",
      biography: "Immanuel Kant (1724-1804) was a German philosopher ..."
    });
    Author.saveAll();
    // an example of a person that is neither an employee, nor an author
    Person.instances["1003"] = new Person({
      personId:1003,
      name:"Tom Daniels"
    });
    Person.saveAll();
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
      [Employee, Author, Person, Book].forEach(Class => {
        Class.instances = {};
      });
      /*
          Employee.instances = {};
          Author.instances = {};
          Person.instances = {};
          Book.instances = {};
      */
      localStorage["employees"] = localStorage["authors"] = localStorage["people"] = "{}";
      localStorage["books"] = "{}";
      console.log("All data cleared.");
    } catch (e) {
      console.log(`${e.constructor.name}: ${e.message}`);
    }
  }
}

export { generateTestData, clearData };
