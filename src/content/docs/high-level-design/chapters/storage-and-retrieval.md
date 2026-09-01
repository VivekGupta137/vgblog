---
title: Storage And Retrieval
---

# Chapter 3 - storage and retrieval

## Chapter three, uh storage and retrieval.

* **Discussion Topic:** How exactly the database handles storage and retrieval of the data that was stored over there.
* **Why this is helpful:** 
  * We definitely not going to implement our own storage engine from scratch.
  * We do need to select a storage engine that is appropriate for my application from the many that are available.
* **Goal:** Is to understand which type of storage engine to select that can perform well on the kind of workload that we need for our application by having a rough idea of the storage, what storage engine is doing under the hood.


### Storage Engine Types
* **Transactional workloads:** Optimized for transactional workloads
* **Analytics:** Optimized for analytics

### Storage Engine Classification (Different Context)
* **Log-structured storage engines**
* **Page-oriented storage engines** (such as B trees)

### Concept of Log & Indexes

* **Log definition:** 
  * The word log in this sense as part of this chapter, we will it will mean an append only sequence of log records.
* **Lookup problem in log-structured storage engines:**
  * Because all the logs if the logs are getting appended one after the other, that means like if you are searching for any key, it needs to do a lookup for the entire file.
  * If let's say there are $n$ records, then it will be in order of $O(n)$ of time complexity.
  * So that is not a good number to efficiently find the value for a particular key.
* **Indexes:**
  * We usually store a different data structure called an index.
  * **The idea behind the index:** It is an additional data structure or a metadata that is kept on the side which helps for faster lookups.
  * **Official definition:** Officially an index is an additional data structure that is derived from primary data.
  * Addition or removal of indexes should not affect the contents of the database; it just affects the performance of the queries.
* **Trade-off:**
  * Even though the indexes improves the read performance, they often incur a overhead especially on writes.
  * Maintaining multiple index means like we have to perform writes in additional places.
  * Hard to beat the performance of simple appending to a file because index also needs to be updated every time the file is written.
  * **Core trade-off:** Indexes can speed up the read queries, but every index slows down the writes.
* **Conclusion:**
  * For this reason, databases don't index everything by default.
### Hash Indexes

* **Overview:**
  * Hash indexes are one of the type of index that is usually used for key value data.
  * Key value stores are quite similar to a dictionary type or sort of like hash map which are usually defined in programming languages.
* **In-Memory Hash Map:**
  * A hash map is an in-memory data structure which contains key value pairs, containing a mapping for each key to the specific value that that key contains.
  * **Memory Optimization:**
    * Since the amount of data that can be stored on the RAM is quite limited, usually what happens is the entire value of the key value pair is stored in the disk separately.
    * In the memory, only the key and the byte offset in the disk is stored.
    * In that way, it reduces the amount of data that needs to be stored in this hash map and improves its performance.
* **Handling Larger Datasets (Segments & Flushing):**
  * Sometimes for bigger use cases, even this is not sufficient because lots of data is there.
  * In that case, it is generally recommended to flush the data from memory to local disk in some sort of a log append format, what we call a segment (log into segments).
  * By making sure that if the log reaches a certain size, we flush those log records into segments in the disk by creating a new segment file.
  * Similarly, if more logs come in and reach another certain size, then again it will be written into the disk.
* **Compaction and Merging:**
  * **Compaction:** Throwing away the duplicate keys in the log because hash index is for key value data.
  * We can perform compaction on the segments by throwing away all the duplicate keys in the log.
  * Moreover, compaction makes the segment smaller and we can merge several segments together.
* **Read / Write Flow with Segments:**
  * Usually what happens is once the segment has been generated, whichever writes or read requests come in which are not there in the in-memory hash map index structure, those will go to the old segment files.
  * Once the merging and compaction of the segments are complete, then the write/latest write request goes to the latest segment file.


### Segment Hash Tables & Lookup Flow
* Each of the segment in its own is a hash table that is stored in the disk with mapping keys to the file offsets.
* In order to find the value for a key:
  1. First we check the most recent segment.
  2. Then we go to the second most recent, and so on.
* We make use of merging process to keep the number of segments small so that we don't have to do lots of lookups many hash maps.

### Implementation Issues & Considerations
* **File Format:**
  * CSV is not good for log.
  * Better to use binary format which is faster and usually smaller compared to CSV.
* **Deletion of Records:**
  * Deletion of records is also difficult because it's log structured storage engine where generally we store such data.
  * What we usually do is keep data file, append a special deletion record that we call **tombstone**.
  * When the log segments are being merged, this record tells to ignore any previous values for that specific key of which is deleted now, so that way that key will be removed.
* **Crash Recovery:**
  * If database is restarted, the in memory hash map is lost.
  * In order to get those data back, we have to reload entire data from disk into the hash memory, but this can take long time.
  * Usually some database vendors make a snapshot of each segment hash map on disk, and this can be used to quickly load up into the memory.
* **Partial Records:**
  * Database can crash anytime like in the midway of writing appending through the log.
  * In order to avoid such scenarios, we can make use of **checksums** so that corrupted parts of the data can be found from the log and to be deleted or ignored.
* **Concurrency Control:**
  * As writes are only appended into the log in a sequential order, a common implementation choice is to use single writer thread.
  * The data file segments are append only otherwise immutable, so that can be read concurrently by multiple threads.


### Limitations of Hash Table Index

* **Memory Constraints:**
  * First one being like entire hash table has to fit in the memory.
  * If the data has large number of keys, then the performance drops considerably.
* **On-Disk Hash Map Difficulties:**
  * In principle, we can store entire snapshot of keys, key values in disk, but retrieving it is difficult.
  * In principle, we can maintain entire hash map on disk, but in practice is usually difficult to make on disk hash map perform well as it requires lots of random access and it's expensive when it become full.
* **Inefficient Range Queries:**
  * Range queries for hash table indexes are not efficient.
  * We cannot scan for all the keys between 1 to 1000 as we have to look up for each of the record individually in the hash maps.

### SS Tables and LSM Trees

* **Overview:**
  * Each of the log structured storage segment is a sequence of key value pairs.
  * And those appears in the segment in the order they were written.
* **Sorted String Table (SS Table):**
  * We can make a simple change to the format of our segment files.
  * Now we require that the key value pairs inside the segment needs to be sorted by the key.
  * We call this format a **sorted string table** or **SS table**.

### Benefits of SS Tables

* **1. Merging segments is simple and efficient:**
  * We can use merge sort algorithm approach (the merge approach used in merge sort algorithm).
  * We read the input files side by side and at the first key in each file copy the lowest key to the output file and repeat like that.
* **2. No need to keep all keys in memory (Sparse Index):**
  * In order to find a particular key in a file, you no longer required to keep the index of all keys in the memory.
  * Since everything is sorted in the segment, if we know that for example a key `handiwork` lies between other keys like `handbag` and `handsome` in the sorted order.
  * Because of sorting information, we already know `handiwork` must appear between the two in the segment.
  * We don't require to keep each and every key present in the memory.
  * Instead, what we can do is keep the keys in memory, but keep it sparse (e.g., for every few kilobytes in the segment file, we keep it in memory).
* **3. Range Queries:**
  * Keeping the SS table format for merging helps us in performing the read request for range queries / sequence of records.


### Constructing and Maintaining SSTables / LSM-Trees

* **Maintaining Sorted Structure:**
  * Maintaining a sorted structure on disk is possible, but maintaining it in memory is much easier.
  * Since we deal with memory in LSM (log structured merge tree / log structured merge storage engines), we can make use of data structures like red-black trees or AVL trees.
  * With these data structures, we can keep the inserted keys in sorted order; we can insert the keys in any order and read them back in sorted order.
  * **Tree comparison:** Red-black tree is more performant because it has flexible balance; AVL tree requires strict balancing.

* **Memtable:**
  * When any write comes, first it will be added into the in-memory balanced tree data structure (like red-black tree, AVL tree).
  * This in-memory tree is generally called a **memtable**.
  * When the memtable gets bigger than some threshold, it is then flushed out into disk as an SSTable file.
  * This can be done efficiently since the data is already sorted in memory.

* **Serving Read Requests:**
  * First we try to find the data in the memtable.
  * Then we find the most recent one in the segment files, in order from newest to oldest.

* **Background Merging & Compaction:**
  * From time to time, we keep merging and compaction process in background to combine the segments and discard the overwritten / deleted values to keep the number of segments low.

* **Crash Recovery & Write-Ahead Log:**
  * **Problem:** This scheme works very well, just suffers with one problem: if the database crashes, the most recent writes are lost.
  * **Solution:** 
    * We can keep a separate log on disk to keep track of every write on disk, to which every write is immediately appended.
    * It is not in sorted order, but it doesn't matter because we just need to restore the memtable after a crash.
    * Once the memtable is flushed into the disk as an SSTable, we can throw away / remove that log and start writing in a fresh tracker again.


### Making an LSM Tree Out of an SSTable

* **Definition:**
  * This indexing structure in which merging and compacting of sorted files are often called LSM storage engines.
  * This sort of indexing structure is called **log structured merge tree** (LSM tree).

### Performance Optimization

* **Looking for Non-Existent Keys:**
  * When looking for the keys that do not exist in the database, as per the concept we have to check the memtable then the segments all the way back to the oldest to make sure that the key does not exist.
  * In order to optimize that, we can use an additional data structure called a **Bloom filter**.
  * **Bloom Filter:**
    * A memory efficient data structure for approximating the contents of a set.
    * It can tell you if a key does not appear in the database.
    * This helps with unnecessary disk reads for non-existing keys.

### Compaction and Merging Strategies

* **Definitions:**
  * **Compaction:** Removal of duplicate keys within the segment.
  * **Merge:** Merging of multiple compacted segments into a single segment.
* **Strategies to Keep the Order and Timing:**
  * **Size-tiered:**
    * If the size of the in-memory data structure becomes greater than some threshold (few megabytes or something), then we write it out in the SSTable immediately.
  * **Level-tiered:**
    * The key range is split into separate levels.
    * Instead of writing into one big file, now the writes are done into separate levels because for each key a specified level is designated there.
    * When it is compacted and merged in the merge process, the data fields will go into their respective table levels.


### B-Trees

* **Overview:**
  * B-tree is a most widely used indexing structure in relational databases and many non-relational databases uses them too.
  * Similar to sorted string tables (SSTables), B-trees also keep key value pairs sorted by key which allows efficient key-value lookups and range queries.

* **Pages & Blocks:**
  * B-tree breaks the database into fixed-size blocks, also called **pages**.
  * Traditionally they are 4 KB in size and read or write one page at a time.
  * The design of B-tree corresponds very closely to the underlying hardware as disks are also arranged in fixed-size blocks.
  * Each page can be identified using an address or location which allows one page to refer another page (similar to pointer, but on disk instead of memory).
  * These page references can be used to construct a tree of pages.

* **Tree Structure:**
  * One page is always designated as the **root** of the B-tree which contains the range of pages.
  * Each page contains several key-value pairs: a sequence of keys, values, and references.
  * References lie between two keys, which indicates the page containing the keys between the boundaries of the keys surrounding that reference (greater than the left one and less than the right one in the page).
  * **Branching factor:** Number of child pages in one page is called the branching factor (references/child page references within a page telling the range of keys they contain).

* **Lookup Process:**
  1. Go to the root page.
  2. Find the range in which the specific value will lie.
  3. Go to that specific page pointer.
  4. Follow similar levels of page pointers until landing on the **leaf node**.
  5. The leaf node is the one which contains the actual values.
  * Following a couple of disk seeks, we can reach to that point.

* **Benefit of Fixed-Size Blocks:**
  * Entire block can be updated at once because in operating system, every disk is arranged in fixed-size blocks as well.
  * Writing of entire blocks is very efficient.

* **Updates & Inserts:**
  * **Update existing key:**
    * Search for the leaf node containing that key.
    * Change the value in that page and write the page back into the disk (the page entirely will get updated).
  * **Add new key:**
    * Figure out which page the key should belong to.
    * If that page is not having enough free space to accommodate a new key, it is split into two half-full pages.
    * The parent page is updated to accommodate the new key.
  * **Tree Balance:**
    * This algorithm ensures that the tree remains balanced.
    * With $N$ keys, it always has the depth of $O(\log N)$.


### Making B-Trees Reliable

* **Basic Overwrite Operation:**
  * The basic underlying write operation of B-tree is to overwrite a page on the disk with new data.
  * It is assumed that the location of the overwritten page does not change and all references to that page remains intact when the page is overwritten.
* **Risks with Multi-Page Operations (e.g., Page Splits):**
  * There are some operations like insert operation that can require several different pages to be overwritten.
  * For example, once a page split is done, we create two pages that was split and also overwrite the parent page to update the reference to the two child pages.
  * This is a dangerous operation because if database crashes only one of the page can be written, and you will end up with corrupt index.
* **Write-Ahead Log (WAL / Redo Log):**
  * In order to make the database more resilient, it is common to use additional data structure on disk that is **WAL** known as **redo log** or **write-ahead log**.
  * This is an append-only file in which every B-tree modification must be written into before it can be applied into the tree itself.
  * In case of database crash, the B-tree can be recreated by following this log.
* **Concurrency Control:**
  * Concurrency control is required if multiple threads are going to access that B-tree at that same time.
  * In those cases, a tree may be in an inconsistent state.
  * Typically done by protecting the tree's data structures with **latches** (lightweight locks).

### B-Tree Optimizations

* **Copy-on-Write Scheme:**
  * Instead of overwriting the page and maintaining WAL for crash recovery, some databases use copy-on-write scheme.
  * Instead of overwriting a page, they will create a new copy and create a modified page written at different location.
  * A new version of the parent pages in the tree is created pointing to the new location.
  * This is also useful for concurrency control.
* **Key Abbreviation / Compression (B+ Tree Space Savings):**
  * We can save space in page by not storing entire key; instead, we can abbreviate it.
  * Especially pages on the interior of the trees only need enough information to act as boundaries.
  * For example, if we know that the leftmost key is like 300 and rightmost is 500, in between we don't need to specify like 350, 400, 450; instead, we can just show delta like 50, 50, and 50.
  * Starting from leftmost, it will be incrementing in order of 50 starting from the first page, which reduces storage.
  * Packing up more keys in same tree allows us to have a higher branching factor (associated with B+ tree variations).
* **Sequential Layout on Disk:**
  * A page can be positioned anywhere on the disk; there is nothing requiring the pages with nearby keys to be close on disk.
  * If database needs to scan large part of the key range in sorted order, page-by-page layout can be inefficient because a disk seek is required for every page to be read.
  * Many B-tree implementations therefore layout the tree so that the leaf pages appear in a sequential order on the disk.
  * However, this is difficult to maintain as the size of the tree grows.


### LSM-Tree vs. B-Tree

* **General Comparison:**
  * LSM tree is general faster for writes because we immediately insert data into the in-memory data structure, that is much faster.
  * B-trees are thought to be faster for reads.
  * Reads are typically slower on LSM trees because they have to check different data structures and SSTables at different stages of compaction.
  * Benchmarks are inconclusive and depend on the nature of the workload.

### Advantages of LSM-Trees

* **Write Overhead in B-Trees vs. LSM-Trees:**
  * In case of B-tree, every piece of data needs to be written twice: once in the write-ahead log and the other in the B-tree page itself.
  * In case of inserts leading to splits, there will be additional page writes.
  * Overhead of writing an entire page at a time even though only few bytes in that page has changed.
  * Some engines even overwrite same pages twice in order to avoid ending up with partially updated page in event of power failure.
  * LSM also rewrite data multiple times because of repeated compaction and merging of SSTables.

* **Write Amplification:**
  * Log structured indexes rewrite data multiple times due to repeated compaction and merging of SSTables.
  * **Definition:** One write to database resulting into multiple writes to the disk over the course of database time is called **write amplification**.
  * Particularly concerning in case of SSDs where a block can only have limited overwrites before it wears out.
  * In write-heavy applications, the performance bottleneck might be the rate at which the database can write to disk.
  * Write amplification has performance cost: as more the storage engine writes to the disk, the fewer writes per second it can handle within the available disk bandwidth.

* **Throughput & Sequential Writes:**
  * LSM-tree is able to sustain higher write throughput than B-trees.
  * Partly because sometimes they have lower write amplification.
  * Partly because they sequentially write compact SSTables rather than having to overwrite at several pages in a tree.

* **Compression & Space Overhead:**
  * LSM-trees can also be compressed better and often produce smaller files on the disk than B-trees.
  * B-tree storage engines leave some space unused due to fragmentation in pages.
  * When a page is split / when a row cannot fit into an existing page, then some space remains unused.
  * Since LSM-trees are not page-oriented, they periodically perform compaction and periodically rewrite SSTables to remove fragmentation.
  * They have lower storage overheads.
  * Many SSD firmware internally uses log structured algorithm to turn random writes into sequential writes on the underlying storage chips, so the impact of storage engine write pattern is less pronounced.


### Downsides of LSM Trees

* **Compaction Impact on Reads and Writes:**
  * In LSM tree during the compaction process, it can sometimes interfere with the performance of ongoing reads and writes.
  * Even though the storage engine tries to perform the compaction incrementally without affecting a current access, disk have limited resources.
  * Disk needs to wait, the request needs to wait while the disk finishes.
  * The response time of the queries to log structured storage engines can sometimes be high.
  * B-trees are more predictable, having more predictable performance in this case.

* **Disk Bandwidth Sharing at High Throughput:**
  * During high write throughput, the disk write bandwidth needs to be shared between initial write and the compaction threads running in the background.
  * When the DB is empty, full disk bandwidth can be used for initial write.
  * However, when the DB is full or as the size in the database becomes larger, more disk bandwidth is required for compaction.

* **Compaction Falling Behind:**
  * If write throughput is high and compaction is not configured properly, it can happen that compaction cannot keep up with the increasing rate of incoming writes.
  * In that case, the segments, number of unmerged segments on the disk keeps on growing until we run out of the disk space.

* **Key Placement & Transactional Isolation (B-Tree Advantage):**
  * One more advantage of B-trees is that each key is exactly in one place.
  * In LSM tree, same key can appear multiple times within a segment or across segments.
  * This aspect makes B-trees more attractive in databases which want to offer strong transactional semantics.



### Other Indexing Structures

* **Primary Key vs. Secondary Indexes:**
  * So far we have only discussed only key value indexes which are primary key index of a relational model.
  * Primary key uniquely identifies a row in a relational table, a document in a document database, a vertex in a graph database.
  * It is also common to have secondary indexes.
  * Secondary index can be quickly formed from a key-value index.
  * **Difference:** A secondary index can contain duplicates (meaning a same secondary index key can map to multiple rows under the same index entry).
  * **Solutions to duplicate problem:**
    * Make each value in index a list of matching row identifiers (a posting list).
    * Make each entry unique by appending a row identifier to it (like the primary index).
  * Both B-trees and log-structured indexes can be used as secondary index.

### Storing Values Within Index

* **The Value in an Index:**
  * The key in an index is what the query searches for.
  * The value can be one of two things:
    1. Actual row
    2. Pointer to a row stored somewhere else / reference to the row stored somewhere else.
* **Heap File Approach:**
  * The place where the rows are stored is known as a **heap file** and stores the data in no particular order.
  * It may be append-only or keep track of deleted rows in order to overwrite them.
  * **Benefits:**
    * Avoids duplication of data when multiple secondary indexes are present (each index just needs to reference the location in the heap file).
    * Efficient updates when updating a value without changing the key: row can be overwritten in place.
  * **Handling Size Increases:**
    * If the new value is larger than the old value and cannot fit in the current place, we need to move that value into a new location in the heap where there is enough space.
    * In that case, we might need to update all the indexes to point to the new heap location of the record, or a forwarding pointer is left behind to old heap location.

* **Clustered Index & Covering Index:**
  * **Clustered Index:**
    * Situation where the value or row is stored directly within the index itself.
    * Example: In MySQL's InnoDB storage engine, the primary key of the table is always a clustered index, and secondary indexes just refer to the primary key rather than the heap location.
  * **Covering Index:**
    * Some of the columns within the row are stored along with the key (not all columns).
    * Helps reduce the overhead of an extra hop.
    * Requires extra effort to enforce transactional guarantees.

### Multi-Column Indexes

* **Concatenated Index:**
  * Most common type of multi-column index.
  * Several fields are combined into one key by appending one column into another.
  * Similar to an old-fashioned paper phone book which provides an index from `(last_name, first_name)` to phone number.
  * Due to sort order, the index can be used to find:
    * All people with a particular last name.
    * All people with a particular `(last_name, first_name)` combination.
  * **Limitation:** The index is pretty useless if you want to find all people with a particular first name alone.

* **Multi-Dimensional Indexes:**
  * A more general way of querying multiple columns at once.
  * Particularly important in geospatial data.
  * **Limitation of Standard Trees:**
    * For a database having latitude and longitude information, a standard B-tree or LSM-tree is not able to answer the query efficiently when looking for all restaurants within a rectangular map area.
    * It can only give you all restaurants in the range of latitudes or all restaurants in the range of longitudes separately.
  * **Techniques & Solutions:**
    * Translate two-dimensional location into a single number using a **space-filling curve**, then use a standard B-tree index.
    * Use specialized spatial indexes like **R-trees** (e.g., PostGIS implements geospatial indexes as R-trees).


### Full Text Search and Fuzzy Indexes

* **Limitation of Previous Indexes:**
  * All the indexes discussed so far assumes that you have the exact data and allow you to query exact values of a key or range of values with a sort order.
  * What they don't allow is similar keys or misspelled words.

* **Full-Text Search Capabilities:**
  * In general, full text search engines commonly allow a search for one word to be expanded to include synonyms of a word.
  * To ignore grammatical variations of word and search for occurrences of word near each other in the same document.

* **Lucene & Edit Distance:**
  * Lucene is able to search text for words within a certain edit distance.
  * An edit distance of 1 means a letter has been added, removed, or replaced.
  * Lucene uses SSTable-like structure for its term dictionary.
  * This structure requires small in-memory index which tells at which offset in the sorted file they need to look for a key.

* **In-Memory Index & Automaton:**
  * The in-memory index in Lucene is a finite state automaton over the characters in the keys (similar to trie / TRIE).
  * This automaton can be transformed into a Levenshtein automaton which supports efficient search of words within the given edit distance.


### In-Memory Databases

* **Disk-Oriented vs. In-Memory:**
  * All the indexes like B-trees, LSM-tree indexes are all related to disk only; these show the data structures in a way it can be written into the disk.
  * As RAM becomes more cheaper, it is often the argument that we can make use of RAM instead of and keep all the data in memory without having to deal with disk because of its slow nature (when comparing with SSDs and hard drives).

* **Caching vs. Durability:**
  * Some of the in-memory key-value stores such as Memcached are intended for caching only.
  * In such scenarios, it is acceptable for data to be lost if the machine is restarted.
  * But other in-memory databases aim for durability as well.

* **Achieving Durability in In-Memory Databases:**
  * Using specialized hardware such as battery-powered RAM.
  * Writing a log of changes to disk.
  * Periodic snapshots to disk.
  * Replicating the in-memory state to other machines.
  * **Operational Advantages of writing to disk:** Files on disk can be easily backed up, inspected, and analyzed by external utilities.

* **Products & Implementations:**
  * **Relational in-memory databases:** VoltDB, MemSQL, Oracle TimesTen are in-memory databases with relational model.
  * **RAMCloud:** An open-source in-memory key-value store with durability guarantees; it uses a log-structured approach for data in memory as well as data on disk.
  * **Redis & Couchbase:** Databases that provide weak durability by writing asynchronously.



### Performance and Advantages of In-Memory Databases

* **Counter-Intuitive Performance Advantage:**
  * Counter-intuitively, the performance advantage of in-memory databases is not due to the fact that they don't need to read from disk.
  * Even the disk-based storage engines may never need to read from disk if you have enough memory because the operating system itself caches the recently used disk blocks in memory anyway.
  * Rather, they can be faster because they can avoid overheads of encoding in-memory data structures in a form which can be written to disk.

* **Data Model Advantages:**
  * Beside performance, there's another area for in-memory database: providing data models which are difficult to implement with disk-based indexes.
  * **Example (Redis):** Redis provides priority queue and sets in its interface because everything is in in memory, so its implementation is comparatively simple.


### Transaction Processing or Analytics

* **Transaction Processing Concept:**
  * A transaction necessarily doesn't need to have ACID properties.
  * Transaction processing just means allowing clients to make low latency reads or writes as opposed to batch processing jobs which runs periodically (example: once every day).
  * Even though the database is used for many different kinds of data (like comments on blog post, actions in a game, contacts in address book), basic actions pattern remains the same for processing business transactions.

* **Online Transaction Processing (OLTP):**
  * An application typically looks up into small number of records by some key using some index.
  * Rows are inserted and updated based on user's input.
  * Because these applications are interactive, they are called **online transaction processing** or **OLTP**.
  * Expected to be highly available to process transactions with low latency since they support critical business operations.

* **Online Analytic Processing (OLAP):**
  * Databases also started increasingly being used for data analytics which has very different access pattern.
  * In an analytic query, the query needs to scan over large number of records only reading few columns per record and calculate aggregate statistics rather than returning the raw data to the user.
  * **Examples of queries:**
    * What was the total revenue of each of our stores in January?
    * How many more bananas than usual we did sales in our latest promotion?
  * These queries are written by business analysts and fed into reports that help the management of the company to make better decisions.
  * To differentiate this access pattern from transaction processing, it's called **online analytic processing** or **OLAP**.

### Data Warehousing & ETL

* **Why Separate Data Warehouse is Needed:**
  * Running OLAP queries on OLTP can be quite expensive because they scan large parts of the data set, which can harm the performance of the concurrent executing transactions.
  * A **data warehouse** is a separate database that the analyst can query to their hearts content without affecting OLTP operations.
  * The database in which entire OLAP analytics is run on is called data warehouse.
  * Contains a read-only copy of all the various OLTP systems in the company.

* **ETL (Extract, Transform, Load):**
  * Data extracted from OLTP database (either using periodic data dump or continuous stream of updates).
  * Transformed into analysis-friendly schema.
  * Loaded into the data warehouse.
  * This process of loading data into data warehouse from OLTP system is called **ETL systems** or **Extract Transform Load**.

* **Characteristics & Ecosystem:**
  * Data warehouses usually exist in large enterprises because small enterprises don't have large amount of data to begin with.
  * Optimized for analytic access patterns because OLTP are not very good in answering analytic queries.
  * **Data Model:** Most commonly relational because SQL is generally a good fit for analytic queries as well.
  * **Storage Engines:** On the surface data warehouse and OLTP database may look similar, but they have very different storage engines optimized for very different query patterns.
  * **Dual-Purpose Systems:** Microsoft SQL Server and SAP HANA have support for both transaction processing and data warehousing in the same product.
  * **Commercial Vendors:** Teradata, Vertica, SAP HANA, and ParAccel typically sell systems under expensive commercial licenses.
  * **Hosted Solutions:** Amazon Redshift is a hosted version of ParAccel.
  * **Big Data / Hadoop Alternatives:** Technologies that have surfaced and compete with commercial data warehousing systems:
    * Apache Hive
    * Spark SQL
    * Cloudera Impala
    * Facebook Presto
    * Apache Tajo
    * Google Dremel



### Schema for Analytics

* **Two Popular Schema Types:**
  * Star schema
  * Snowflake schema

* **Star Schema (Dimensional Modeling):**
  * Many data warehouse generally used star schema or also known as **dimensional modeling**.
  * **Fact Table:**
    * At the center of such schema is so-called fact table.
    * Each row in the fact table represents some event that has occurred at a particular time (e.g., a page view or click by a user).
    * Some columns are attributes (such as price at which a product was sold and cost of buying from the supplier).
    * Other columns are foreign key references to other tables called **dimension tables**.
    * Each row in the fact table represents who, what, where, when, how, and why of the event.
  * **Dimension Tables:**
    * One of the dimension can be like the product that was sold.
    * The fact table will contain the foreign key to product dimension table.
    * The product dimension table will contain more information like the brand, category, description, etc.
    * Event date and time are often represented as dimension tables because this allows additional information about the dates to be encoded as well (e.g., public holidays, allowing queries to differentiate between sales on holiday and on non-holidays).
  * **Origin of Name:**
    * Comes from the fact that the table relationships are visualized with a fact table in the middle, surrounded by dimension tables connected through like rays of star.

* **Snowflake Schema:**
  * A variation of this template is also called snowflake schema.
  * In snowflake schema, the dimensions are further broken down into sub-dimensions.
  * **Example:** In each row of the product dimension table, it could refer to the brand and category as foreign keys rather than storing them as strings in the product dimension table.

* **Comparison & Table Characteristics:**
  * Star schema is often preferred because they are simpler for the analyst to work with.
  * In typical data warehouse, tables are very wide.
  * Fact tables can often have like 100+ columns.

### Column-Oriented Storage


### Column-Oriented Storage

* **Challenge:**
  * If you have trillions of rows and petabytes of data in fact tables, storing them and querying them efficiently becomes a challenging problem.
  * Although fact tables are often 100+ columns wide, a typical data warehouse query only refers or accesses 4 to 5 columns at a time.
  * It accesses a large number of rows, however, but it only needs to access 3 or 4 columns.

* **Row-Oriented vs. Column-Oriented:**
  * **Row-Oriented Storage (Most OLTP Databases):**
    * All the values from one row of the column are stored next to each other.
    * Document databases are similar: entire document is stored in one contiguous sequence of bytes.
    * When processing a query with lots of data but referring to only few columns, a row-oriented engine still needs to load all rows from disk, parse them, and filter out columns that do not meet the condition (takes a long time).
  * **Column-Oriented Storage:**
    * The idea behind column-oriented storage is simple: instead of keeping all the values in a row together, we keep all the values in a column together.
    * Each column is stored in a separate file.
    * A query only needs to read and parse those columns that are used in the query, saving a lot of work.

* **Column Compression:**
  * Storing data in a column fashion can also help with column compression.
  * Compressing the data in a column can increase disk throughput.
  * In a column, similar types of values or sequences of values are stored, and they often look quite repetitive, which is a good sign for compression.
  * **Bitmap Encoding & Run-Length Encoding:**
    * An effective way to compress data is **bitmap encoding** in data warehouses.
    * Can take a column with $n$ different values and turn it into $n$ separate bitmaps.
    * One bitmap can represent each distinct value with one bit for each row (if very small, stored with one bit per row).
    * We can further reduce it with the help of **run-length encoding**.
    * Bitmaps are very well suited for kinds of queries that are common in data warehouses.

* **Column-Oriented Storage vs. Column Families:**
  * Cassandra and HBase have a concept of *column families*.
  * Within each column family, they store all the columns from a row together along with row key.
  * They do not use column compression.

### Memory Bandwidth and Vectorized Processing

* **Bandwidth Bottlenecks:**
  * For queries scanning over millions of rows, a big bottleneck is bandwidth for getting data from disk into memory.
  * Developers of analytical databases also need to worry about efficiently using the bandwidth from main memory to the CPU cache.
* **SIMD & Vectorized Processing:**
  * They make use of **SIMD** (Single Instruction Multi Data) instructions in multi-CPU architectures.
  * Column-oriented database storage layouts make efficient use of CPU cycles.
  * A chunk of a column that fits comfortably in CPU L1 cache can be iterated through in a tight loop.
  * A CPU can execute such a loop much faster than code that requires lots of function calls and conditions for each record processed.
  * Operators like bitwise `AND` and `OR` can be designed to operate on chunks of compressed column data directly (known as **vectorized processing**).

### Sort Order in Column Storage

* **Row Alignment & Sorting Entire Rows:**
  * It doesn't matter in which order the rows are stored in a column store; easiest is to store them in the order inserted (appending to each column file).
  * We can choose to impose an order.
  * It won't make sense to sort each column independently because we no longer know which items in the column belong to the same row.
  * We can only reconstruct the row because we know the $k$-th item in one column belongs to the same row as the $k$-th item in another column.
  * The data needs to be sorted an entire row at a time.

* **Choosing Sort Keys:**
  * Administrator chooses columns by which table should be sorted based on knowledge of common queries.
  * *Example:* Making `date_key` the primary sort key allows the query optimizer to scan through rows from the last month much faster than scanning all rows.
  * A second column determines sort order for rows with identical values in the first column (e.g., `product_id` as second sort key so all sales for the same product on the same day are grouped together).

* **Compression Benefits of Sorting:**
  * If the primary sort column doesn't have many distinct values, after sorting it will have long sequences of repeated values.
  * Simple run-length encoding after bitmap encoding can compress the column to a few kilobytes even if it contains billions of rows.
  * Compression is strongest in the first-order key; second and third-order keys will be more jumbled up with fewer long runs of repeated values.

* **Multiple Sort Orders (Extension):**
  * Different queries benefit from different sort orders.
  * Store the same data sorted in several different ways across replicated machines.
  * Since data needs to be replicated across multiple machines anyway for fault tolerance, analysts can use the replica version that best fits the query pattern.

### Writing to Column-Oriented Storage

* **The Challenge with Writes:**
  * Column-oriented storage, compression, and sorting make reads faster, but make writes more difficult.
  * Update-in-place approaches (like in B-trees) are not possible with compressed columns.
  * Inserting a new row in the middle of a sorted table requires rewriting all column files (since rows are identified by their position within a column).
* **LSM-Tree Solution for Columnar Writes:**
  * All writes first go into an in-memory store where they are added into a sorted structure and prepared for writing to disk.
  * It doesn't matter whether the in-memory structure is row-oriented or column-oriented.
  * When enough writes accumulate, they are merged into the column files on disk and written in bulk.

### Data Aggregation, Data Cubes, and Materialized Views

* **Materialized Aggregates & Views:**
  * Columnar storage is significantly faster for ad hoc analytical queries, but data warehouses often use materialized aggregates.
  * Queries frequently involve aggregate functions (`COUNT`, `SUM`, `MIN`, `AVG`, `MAX`).
  * If the same aggregates are used by multiple queries, re-crunching raw data every time is wasteful.
  * **Materialized View:** Caching counts and sums that queries use most often by writing an actual copy of the query results to disk.
  * **Virtual View vs. Materialized View:**
    * *Virtual View:* Just a shortcut for writing queries; SQL engine expands and executes the underlying query on the fly every time it is referenced.
    * *Materialized View:* Actual copy of results is stored on disk. When underlying data changes, the materialized view needs to be updated.
    * Updates make writes more expensive, which is why materialized views are not as popular in OLTP databases.

* **Data Cubes (OLAP Cubes):**
  * A special case of materialized view known as a **data cube** or **OLAP cube**.
  * It is a grid of aggregates grouped together by different dimensions.
  * *Example (2D):* Fact table has foreign keys to two dimension tables (`Date` and `Product`). A 2D grid contains aggregated sums (e.g., net price) along `Date` and `Product` axes, with totals summarized across rows and columns.
  * Can be expanded into multi-dimensional space (e.g., 5 dimensions: `Date`, `Product`, `Store`, `Promotion`, `Customer`).
  * **Advantages:** Certain queries become very fast because results are effectively pre-computed without scanning millions of rows.
  * **Disadvantages:** Lacks the flexibility of querying raw data (e.g., cannot calculate what portion of sales comes from items costing more than $100).

