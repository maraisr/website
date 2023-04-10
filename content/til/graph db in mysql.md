---
title: graph database in mysql
summary: How to create a graph database in pure MySQL with the help of JSON columns.
date: 2022-09-20
tags: [mysql]
---

I was recently playing around with a database for a hobby project and wanted to design a database schema for it.

Lots of looking about, and stumbled upon
[(TAO) — The Object Association](https://cs.uwaterloo.ca/~brecht/courses/854-Emerging-2014/readings/data-store/tao-facebook-distributed-datastore-atc-2013.pdf).
There is a lot in there, but the main moment was the `object` and `association` tables.

Let's go from a relational model to a graph model!

... and turns out a lot has changed in the last 7~ years since I last touched MySQL. It
[now supports JSON data types](https://dev.mysql.com/doc/refman/5.7/en/json.html), which made this journey so much
easier.

_This is it here, just 2 tables for everything 🎉_

```mysql
-- The nodes or entities in the system
CREATE TABLE object
(
    id      char(16)    NOT NULL default (lower(hex(random_bytes(8)))),
    otype   varchar(10) NOT NULL,
    data    JSON,
    created timestamp            default current_timestamp,
    updated timestamp            default current_timestamp on update current_timestamp,
    PRIMARY KEY (id),
    UNIQUE KEY object_id_otype (id, otype),
    INDEX object_created (created DESC),
    INDEX object_updated (updated DESC)
) ENGINE = InnoDB;

-- and the relationship between them
CREATE TABLE assoc
(
    id1   char(16)    NOT NULL,
    atype varchar(10) NOT NULL,
    id2   char(16)    NOT NULL,
    data  JSON,
    time  timestamp default current_timestamp,
    PRIMARY KEY (id1, atype, id2),
    INDEX assoc_to (atype, id1),
    INDEX assoc_from (atype, id2)
) ENGINE = InnoDB;
```

### Delight

It just makes caching so much easier as you can just cache a whole row. No need to juggle cache keys on a coarse
selection of fields.

> It's easier to cache a whole row, than to cache a selection of fields.

### But what about joins?

Joins happen at the application level, not the database level. Typically you ask the database to join say the _users_
and the _comments_ tables and return a subset of data, this is not what is happening here. Far easier to apply access or
privacy policies in the application tier (as that is where that context lives), than in the queries.

### Patterns

Some patterns of working with this data model, because does take some getting used to.

> Typically, a query is something like; `JOIN <table> ON <condition>`, the graph model this is now written as
> `JOIN <table> WHERE <condition>`.

#### Get an object by its id

```mysql
SELECT id, otype, data FROM object WHERE id = ?
```

#### Validate that a relationship exists

```mysql
SELECT true FROM assoc WHERE atype = ? AND id1 = ? AND id2 = ?

# eg: SELECT true FROM assoc WHERE atype = 'AUTHORED' AND ...
# see if a user has a authored a post
```

#### Get a connection of nodes

Something like getting all blog posts by a user, `id2` here being the object ID (remember join at the application
level).

```mysql
SELECT id2 FROM assoc WHERE atype = ? AND id1 = ?
```

...and that's it. You only really need to _get a node_, _check for the existence of nodes_, and _get a collection of
nodes_. The rest is built-up abstractions in the application tier.
