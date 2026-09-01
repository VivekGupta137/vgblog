---
title: Data Models And Query Languages
---

# Chapter 2 - Data-Models-and-Query-Languages

## Chapter Two: Data Models and Query Languages

### Relational Model Versus Data Model
- Relational in relational model of data modeling, the data is organized into tape into relations also called tables in SQL where each relation is an unordered set of tuples also called rows in SQL.

### Need Behind Adoption of NoSQL Databases
- **Greater scalability** than relational tables can achieve including very high data sets, very large data sets or very high right throughput.
- A **specialized query operation** that are not very well supported in relational model.
- **Restrictiveness of relational schemas** and a desire for more expressive data model.

### The Object-Relational Mismatch
- So usually what happens is that like in data model in document model sorry so in object oriented programming most of the data is represented in the application code is as object which has a one to one mapping to a JSON format.
- Okay so if data is getting stored in relational tables there is an awkward translation layer between objects in application code and the data base models in the of tables rows and columns.
- There are some frameworks like **active record** and **hibernate** which helps with the object relational mapping to reduce the amount of boiler plate code that is required for this translation layer.

### Document Model vs. Relational Model
- For example a data structure like a resume which is mostly a self-contained document a JSON representation can be quite appropriate.
- And document oriented databases like **MongoDB**, **RethinkDB**, **CouchDB** supports this data model.
- However for the same thing in like relational table we will have to create normalized representations to put in like positions, education, contact information in separate tables with foreign key reference to the users table.
- Okay so that brings us the question of like JSON representation has better data locality than the multi table schema.
- The **one to many relationships** is what we can represent effectively with the JSON data model. Okay or like document model that has JSON representation.
- **Many to one and many to many relationships**: So these relationships are usually not supported by the document model however we can do it easily through this relational databases.

## Document vs Relational Model: Relationships, Schema, and Locality

### Relationships and Joins
- For example, like the relationships like many people live in a particular region or many people work at a particular industry.
- These don't seem to fit nicely with the document model.
- As in relational model, it is often preferred to use uh use to like use foreign keys to refer to the other tables by IDs because joints are easy.
- Since in document models, joints are weak.
- So as joints are not needed for one to many tree structures, support for joints is often weak. Okay.

### Application Code Complexity
- So, So, there are many differences to consider when comparing relational databases to a document database, including the fault tolerance, tolerance properties, handling of concurrency and differences in data model.
- Which data model leads to simpler application code.
- If the application has mostly like document like structure, then it's probably like better to use document model because you can directly pull in without having to create query multiple tables.
- However, there are limitations like you cannot refer to the nested item within a document.
- There is a poor support for joints. Okay, like you cannot join two elements.
- If you want to do a join, you need to emulate it in the application code by making multiple requests to the database, but that also adds complexity in the application code itself.

### Schema Flexibility: Schema-on-Read vs Schema-on-Write
- So, schema flexibility in document model.
- Document models are usually called schema less, but it's misleading because there is a implicit schema that is not enforced by the database.
- However, the more accurate term is **schema on read**.
- The structure of the data is implicit and is only interpreted when the data is read.
- And in contrast, there is another one that is **schema on write**.
- That is the traditional approach of relational databases where the schema is explicit and the database ensures all the written forms to it. Written data confirms to it. Okay.
- So, schema on read is like sort of dynamic runtime checking and schema on write is like static compile time checking.

### Handling Schema Changes
- The difference between the approaches is noticeable when the application wants to change the date the format of data. Okay, like in the table, for example, like I want to change some column or add some new column. Okay.
- And here in document database, you need to write new documents with new fields.
- For the older documents, we need to handle it in a way that it still works. Okay.
- So that the older documents won't update. So the all the documents are not updated actually.
- However in the application code, we handle it so that like it works like in the same way. Okay.
- For example, if we had initially the name field in the document table, now we want to have like first name as well. Okay, so all all the older documents that is stored in the document database will stay like that only, but the new ones will have the first name.
- So in the application code, we have to write a if else condition, some like if the user has name and has and is not having the first name, in those scenarios, we have to pick the first name by splitting the user.name and taking the first split it value.
- On the other hand, in the statically typed or like a relational database schema, we will simply run a query to alter the table to add a column, update the that specific new column, that being the first name, and we are done. Okay, so that takes like milliseconds and our schema will be confirmed for all the future queries.

### Advantages of Schema-on-Read
- Schema on right approach is advantageous if the collection don't all have same structure for some reason. For example, like the data is heterogeneous. Okay, so if there are multiple types of objects, it is not practical to put each of them in its own table. Okay, like each type of object in its own table.
- The structure and also in such other cases like when structure of the data is determined completely by the external system on which we do not have any control and can change at any time.
- For example, like in case of, for example, what we can say, web hooks or something like the response that we get from the third party systems, for example, like on execution of the web hook, it is not standard. Okay, so that can change as per their will, but we don't care about that. We just want that to be stored in the database so that we can access that information.

### Data and Storage Locality
- And yeah, coming to the advantages of this thing, document model, there is a performance there is something called **storage locality** since entire document can be stored next to another like under one umbrella for document database.
- So we will have like a little bit of performance advantage on this for storage locality.
- The locality advantage only applies if we are reading large parts of document at the same time. Okay, so typically the database in the document database typically needs to load the entire document even if we want to access a small part, very small portion of the data, which can be a wasteful of on in case of large documents.
- And in case of updates made to a document, entire documents needs to be rewritten modifications. So that is also one of the cons over here.

### Convergence of Relational and Document Databases
- Currently, Postgres since version 9.3 and other SQL databases have also added some level of support for JSON documents given the popular of popularity of JSON for web APIs.
- On the other hand, document database side Now also resolve Mongo DB drivers can automatically resolve document references uh effectively working as performing a client side join although this is like click to be slower than the joint performed in the database


## Imperative Query Language Versus Declarative Query Language

### Imperative Query Language
- So most of the programming languages are like imperative.
- For example, if you want um list of animal species, you'll write a for loop and which will iterate through each of the animals and search for uh the specific animal that we need.
- Imperative language tells the computer to perform certain operations uh in a certain order um to get the data.

### Declarative Query Language
- However, for declarative query language, we just ask that hey, give me um uh the family uh from the family of animals, I just want to know um list of all the animals whose family is like shark. Okay.
- But in declarative uh query language like SQL or relational algebra, you specify the pattern of the data you want, what conditions uh the results should meet, and how you want the data to be transformed. But not how to achieve that goal.

### Declarative Queries Beyond Databases
- Some examples for declarative queries can be like not only in SQL but it is also used in web apps as well.
- For example, like CSS selectors or XPath expression for selecting some elements in HTML page.
- Both are declarative languages for specifying like for finding a specific element.
- However, in JavaScript code document object model API, we can achieve the same by iterating through all the list of elements in a imperative query manner.


## MapReduce Query Model

### Overview
- Map reduce is a programming model generally used for processing large amounts of data in bulk across multiple machines.
- There are couple of no sequel data stores including Mongo DB and Couch DB which provides this as a mechanism for performing read only queries across many documents.
- So map reduce is neither a declarative nor fully a imperative query API. It is something between them.
- So the logic is written or like logic of the query is expressed in snippets which are repeatedly called by the processing framework.
- It is based on **map** also known as collect and **reduce** also known as to fold or object inject functions that exist in many functional programming languages.

### How Map and Reduce Functions Work
- So the map emits a key that can be a string or like year, month or like date. Okay. And a value. Okay. So the map function emits a key and a value. Okay.
- And these key value pairs are then grouped together by key and sent to the reduce function all at once. Okay.
- So the reduce function does some processing and reduces the result or folds the result into some value. Okay. So that is basically map reduce what it is.

### Constraints and Properties
- Map and reduce functions are pure functions meaning they can only use the data that is passed to them as input and they cannot perform any additional database queries and they should not have any side effects.
- This helps database to run functions in anywhere these functions in anywhere in any order and return them on failure. Okay. But yeah.

### Drawbacks
- So map reduce is fairly low level programming model. Okay. For distribution distributed execution on cluster machines.
- A usability problem with map reduces that like you have to write a carefully coordinated query. Okay. Carefully coordinated query functions basically map and reduce which are often harder than writing a single query.
- Moreover declarative query offers more opportunities for query optimizer to improve the performance of the query for these reasons. Yeah.


## Graph-Like Data Models

### Overview
- Graph like data models are like we saw for the document models those are like very good with the structure of data in which have like one to many relationship or have no relationships between documents or records okay so but here in graph like data model is generally preferred when we have many to many in like data model where many to many relationships are very common in the data.
- Relational model can handle simple cases of many to many relationships but the connections often become more complex and it becomes natural to start modeling your data as a graph.
- Graph has two kinds of objects one being **vertices** another being the **edges** okay so vertices are like the nodes or entities and edges are the relationships.

### Examples of Graph-Like Data Models
- **Social graph**: vertices are people edges indicate people who know each other
- **Web graph**: vertices are the pages and edges indicate the indicate the HTML links to other pages
- **Rails or rail networks**: vertices are junctions edges represent the roads or railway lines between them.

### Graph Algorithms
- So there are well known algorithms that can operate on these graphs okay. For example like shortest path within two points or page rank which can be used to rank on the web graph to determine the popularity of the page and ranking the search results okay.

### Heterogeneous Data Support
- So it's not like graph can only be limited to homogeneous data but it is equally powerful to use graph in a for storing like data of various types okay of different types of objects in a single data store.
- For example Facebook maintains single graph with many types of vertices and edges vertices represent people location events check ins location comments and edges indicate which people are friends with each other which check in happened at which location who commented on which post who attended which event and so on.

### Structuring and Querying Models
- There are several way of structuring and querying data in graphs okay so there are two very popular model:
  - **Property graph** which is implemented by new forger Titan and infinite graph
  - **Triple store model** graph model implemented by datomic algo graph others
- And for these graph models there are some declarative query languages like cipher spark ql and data log.

### Property Graphs
- Okay so the property graphs property graphs are the graph where it contains like vertex and edges:
  - **Vertex**: contains a unique identifier collection of properties or key value pairs
  - **Edges**: contains a unique identifier and the vertex where it's the edge starts that is the tail vertex and the vertex The vertex at which the edge ends called head vertex.
  - The label used to describe different kinds of vertex and a property, a collection of properties or key value pairs.
- A graph can also be visualized like uh uh uh like having two relational tables, one for vertices, other for edges. Okay, and vertices table has like vertex ID and which is a primary key and and properties which are in JSON format. And edges table will have like edge ID which is the primary key, tail vertex, head vertex, label and property. Label in the edges are generally used for like making uh queries, okay, writing queries.
- So, uh in this model, in the property graph model, a vertex can have edge connecting it with any other vertex. There is no schema restriction. Okay, uh on which kind of edges can be can or cannot be associated. Okay, uh given vertex, you can find both incoming and outgoing edges and traverse the graph by following a chain of vertices uh by using different labels for different kind of relationships. You can store different kinds of information in a single graph while maintaining a clean data model.
- Graphs are good for evolvability as well. Uh uh as you can add features to the application and graph can uh easily be extended to accommodate changes to your application data structures.

### Cypher Query Language
- The query language, Cypher query language. Cypher is a declarative query language for property graphs created by Neo4j database.

## Triple-Store Data Model

### Overview
- Uh, triple stores. So, triple store model is uh, almost same as the property graph model. Uh, just using different words to describe same ideas.
- Then triple store, all the information is stored in form of triplets. Okay. Uh, three part statements like uh, subject, predicate, and object.
- For example, Jim likes bananas. Jim is the subject, likes is the predicate, and bananas is the object.

### Subjects, Predicates, and Objects
- And um, the object can be uh, so the subject of the uh, triple uh, store is like uh, a vertex in the graph, okay. Is a equivalent to the vertex in the graph.
- However, the object can be one of the two things:
  - Uh, it can be either a value, uh, in which case, uh, the predicate and object are equivalent to key value uh, property on the subject vertex.
  - And alternatively, the object can be another vertex in the graph. In that case, the predicate uh, behaves as edge in the graph. Okay. And the subject is the tail vertex, and the object is the head vertex.

### SPARQL Query Language
- In order to query this, so, SPARQL query language is used.
- SPARQL query, SPARQL is a query language for triple stores using the RDF data model.
- It predicates cipher and cipher pattern matching.


## Document Databases vs. Graph Databases vs. Relational

### Model Comparisons
- Uh somebody here document databases target the use cases where data comes in self-contained documents and lessons between one document and other document is rare
- graph databases go in opposite direction where it targets the use cases where anything is potentially related to everything.
- Relational model can be used to emulate a graph model however the um querying becomes like bit clunky okay
- so that's why we have different systems for different purpose not a single size fits all solution.

### Common Characteristics
- One thing that document and graphs database have in common is that uh they typically don't enforce schema on the data which they store that helps uh to that makes it easy to adapt applications to changing requirements.

### Query Languages and Frameworks
- Each data model comes with its own query language or framework like sequel map reduce mongo db's aggregation pipeline cypher spark ql data log uh css x path which aren't uh database query language but have interesting parallels.

### Domain-Specific Data Models and Custom Solutions
- Although uh there are so many data models we have covered like but these are not the only ones
- there are researchers working on genome data they need to do sequence similarity searches which means taking a very long string um uh for a dna module and matching it against large database of strings that are similar but not identical.
- None of the database described here can handle this kind of usage that's why researchers have written a specialized genome database like gen bank
- similarly particle physicists have been doing big data style large scale data analysis for decades and the projects like large hadron collider now works with hundreds of petabytes at scale at such a scale custom solutions are required to stop hardware cost from running out of control.


