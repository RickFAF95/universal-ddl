import { AstColumn, AstColumnConstraint, AstCreateTable, AstDefaultColumnConstraint, AstForeignKeyColumnConstraint, AstNotNullColumnConstraint, AstNullColumnConstraint, AstUniqueColumnConstraint } from "../src/ast"
import { parseDdlToAst } from "../src/parser/parse-ddl"

describe("AST Specification for columns", () => {

  const simpleTypes = ["int", "integer", "bigint", "smallint", "tinyint", "real", "date", "time", "datetime",
    "timestamp", "text"]
  for (const dataType of simpleTypes) {
    test(`data type: ${dataType}`, () => {
      const input = `
        create table t1(
          a ${dataType}
        );
        `
      const table = parseDdlToAst(input).orders[0] as AstCreateTable
      const column = table.entries[0] as AstColumn
      expect(column.type).toEqual(dataType)
    })
  }

  const paramTypes = [
    {
      type: "char",
      args: [20]
    },
    {
      type: "varchar",
      args: [25]
    },
    {
      type: "decimal",
      args: [4, 2]
    },
    {
      type: "decimal",
      args: [8]
    },
    {
      type: "numeric",
      args: [4, 2]
    },
    {
      type: "numeric",
      args: [8]
    },
    {
      type: "float",
      args: [5]
    },
  ]
  for (const { type, args } of paramTypes) {
    test(`data type: ${type}(${args.join(", ")})`, () => {
      const input = `
        create table t1(
          a ${type}(${args.join(", ")})
        );
        `
      const table = parseDdlToAst(input).orders[0] as AstCreateTable
      const column = table.entries[0] as AstColumn
      expect(column.type).toEqual(type)
      expect(column.typeArgs).toEqual(args)
    })
  }

  test("not null", () => {
    const input = `
      create table t1(
        a integer not null
      );
      `
    const table = parseDdlToAst(input).orders[0] as AstCreateTable
    const column = table.entries[0] as AstColumn
    expect(column.constraints![0]).toEqual({
      constraintType: "notNull"
    } as AstNotNullColumnConstraint)
  })

  test("column constraint: null", () => {
    const input = `
      create table t1(
        a integer null
      );
      `
    const table = parseDdlToAst(input).orders[0] as AstCreateTable
    const column = table.entries[0] as AstColumn
    expect(column.constraints![0]).toEqual({
      constraintType: "null"
    } as AstNullColumnConstraint)
  })

  test("column constraint: primary key", () => {
    const input = `
      create table t1(
        a integer not null primary key
      );
      `
    const table = parseDdlToAst(input).orders[0] as AstCreateTable
    const column = table.entries[0] as AstColumn
    expect(column.constraints).toEqual([
      { constraintType: "notNull" },
      { constraintType: "primaryKey" }
    ] as AstColumnConstraint[])
  })

  test("column constraint: primary key autoincrement", () => {
    const input = `
      create table t1(
        a integer not null primary key autoincrement
      );
      `
    const table = parseDdlToAst(input).orders[0] as AstCreateTable
    const column = table.entries[0] as AstColumn
    expect(column.constraints).toEqual([
      { constraintType: "notNull" },
      { constraintType: "primaryKey" },
      { constraintType: "autoincrement" }
    ] as AstColumnConstraint[])
  })

  test("column constraint: primary key references", () => {
    const input = `
      create table t1(
        a integer not null primary key references other_table(b)
      );
      `
    const table = parseDdlToAst(input).orders[0] as AstCreateTable
    const column = table.entries[0] as AstColumn
    expect(column.constraints).toEqual([
      { constraintType: "notNull" },
      { constraintType: "primaryKey" },
      {
        constraintType: "foreignKey",
        referencedTable: "other_table",
        referencedColumn: "b"
      },
    ] as AstColumnConstraint[])
  })

  test("default sql value", () => {
    const input = `
      create table t1(
        a timestamp default current_timestamp
      );
      `
    const table = parseDdlToAst(input).orders[0] as AstCreateTable
    const column = table.entries[0] as AstColumn
    expect(column.constraints![0]).toEqual({
      constraintType: "default",
      value: {
        type: "sqlExpr",
        value: "current_timestamp"
      }
    } as AstDefaultColumnConstraint)
  })

  test("default string value", () => {
    const input = `
      create table t1(
        a varchar(200) default 'John '' Wick'
      );
      `
    const table = parseDdlToAst(input).orders[0] as AstCreateTable
    const column = table.entries[0] as AstColumn
    expect(column.constraints![0]).toEqual({
      constraintType: "default",
      value: {
        type: "string",
        value: "John ' Wick"
      }
    } as AstDefaultColumnConstraint)
  })

  test("default int value", () => {
    const input = `
      create table t1(
        a integer default 123
      );
      `
    const table = parseDdlToAst(input).orders[0] as AstCreateTable
    const column = table.entries[0] as AstColumn
    expect(column.constraints![0]).toEqual({
      constraintType: "default",
      value: {
        type: "int",
        value: 123
      }
    } as AstDefaultColumnConstraint)
  })

  test("default float value", () => {
    const input = `
      create table t1(
        a numeric(4,2) default 12.35
      );
      `
    const table = parseDdlToAst(input).orders[0] as AstCreateTable
    const column = table.entries[0] as AstColumn
    expect(column.constraints![0]).toEqual({
      constraintType: "default",
      value: {
        type: "float",
        value: 12.35
      }
    } as AstDefaultColumnConstraint)
  })

  // test("default sql expression: null", () => {
  //   const input = `
  //     create table t1(
  //       a timestamp default null
  //     );
  //     `
  //   const table = parseDdlToAst(input).orders[0] as AstCreateTable
  //   const column = table.entries[0] as AstColumn
  //   expect(column.constraints![0]).toEqual({
  //     constraintType: "default",
  //     value: {
  //       type: "sqlExpr",
  //       value: "null"
  //     }
  //   } as AstDefaultColumnConstraint)
  // })

  test("column constraint: foreign key", () => {
    const input = `
      create table t1(
        a integer references other_table(b)
      );
      `
    const table = parseDdlToAst(input).orders[0] as AstCreateTable
    const column = table.entries[0] as AstColumn
    expect(column.constraints![0]).toEqual({
      constraintType: "foreignKey",
      referencedTable: "other_table",
      referencedColumn: "b"
    } as AstForeignKeyColumnConstraint)
  })

  test("named column constraint: foreign key", () => {
    const input = `
      create table t1(
        a integer constraint fk1 references other_table(b)
      );
      `
    const table = parseDdlToAst(input).orders[0] as AstCreateTable
    const column = table.entries[0] as AstColumn
    expect(column.constraints![0]).toEqual({
      name: "fk1",
      constraintType: "foreignKey",
      referencedTable: "other_table",
      referencedColumn: "b"
    } as AstForeignKeyColumnConstraint)
  })

  test("column constraint: foreign key on delete cascade", () => {
    const input = `
      create table t1(
        a integer references other_table(b) on delete cascade
      );
      `
    const table = parseDdlToAst(input).orders[0] as AstCreateTable
    const column = table.entries[0] as AstColumn
    expect(column.constraints![0]).toEqual({
      constraintType: "foreignKey",
      referencedTable: "other_table",
      referencedColumn: "b",
      onDelete: "cascade"
    } as AstForeignKeyColumnConstraint)
  })

  test("column constraint: unique", () => {
    const input = `
      create table t1(
        a integer unique
      );
      `
    const table = parseDdlToAst(input).orders[0] as AstCreateTable
    const column = table.entries[0] as AstColumn
    expect(column.constraints![0]).toEqual({
      constraintType: "unique"
    } as AstUniqueColumnConstraint)
  })

  test("named column constraint: unique", () => {
    const input = `
      create table t1(
        a integer constraint u1 unique
      );
      `
    const table = parseDdlToAst(input).orders[0] as AstCreateTable
    const column = table.entries[0] as AstColumn
    expect(column.constraints![0]).toEqual({
      constraintType: "unique",
      name: "u1"
    } as AstUniqueColumnConstraint)
  })
})
