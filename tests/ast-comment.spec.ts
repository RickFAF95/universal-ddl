import { AstCreateTable } from "../src/parser/ast"
import { parseDdlToAst } from "../src/parser/parse-ddl"

describe("AST Specification for comments", () => {

  test("inline comments on table", () => {
    const input = `
      create table t1( -- comment on t1 #1
        a integer
      ); -- comment on t1 #2
      `
    const table = parseDdlToAst(input).orders[0] as AstCreateTable
    expect(table.inlineComment).toEqual(["comment on t1 #1", "comment on t1 #2"])
  })

  test("block comments on table", () => {
    const input = `
      -- comment on t1 #1
      -- comment on t1 #2
      create table t1(
        a integer
      );
      `
    const table = parseDdlToAst(input).orders[0] as AstCreateTable
    expect(table.blockComment).toEqual("comment on t1 #1\ncomment on t1 #2")
  })

  test("inline comments on column", () => {
    const input = `
      create table t1(
        a        -- comment on a #1
        integer, -- comment on a #2
        b       -- comment on b #1
        integer -- comment on b #2
      );
      `
    const table = parseDdlToAst(input).orders[0] as AstCreateTable
    expect(table.entries[0].inlineComment).toEqual(["comment on a #1", "comment on a #2"])
    expect(table.entries[1].inlineComment).toEqual(["comment on b #1", "comment on b #2"])
  })

  test("block comments on column", () => {
    const input = `
      create table t1(
        -- comment on a #1
        -- comment on a #2
        a integer
      );
      `
    const table = parseDdlToAst(input).orders[0] as AstCreateTable
    expect(table.entries[0].blockComment).toEqual("comment on a #1\ncomment on a #2")
  })
})
