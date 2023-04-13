const sql = require('mssql');
const { db } = require('../config/env');
let instanceDb = null;

const initDb = async () => {
  if (!instanceDb) {
    instanceDb = await sql.connect(db);
  }
  return instanceDb;
};

module.exports = (table) => {
  let query = null;
  let queryToCount = query;
  let hasWhere = false;
  let associations = [];

  return {
    select(columns = '*') {
      if (Array.isArray(columns)) {
        columns = columns.join(', ');
      }
      query = `select ${columns} from ${table}`;
      queryToCount = query;
      return this;
    },
    associate({
      type = 'hasMany',
      table = null,
      localKey = null,
      foreignKey = null,
      select = '*',
      conditions = null,
      join = null,
      as = null
    } = {}) {
      if (type !== 'hasMany') {
        throw new Error('Put the type in association fields!');
      }

      const hasAllFields = table && localKey && foreignKey;

      if (!hasAllFields) {
        throw new Error('Put the association fields!');
      }

      let newAssociation = {
        table,
        localKey,
        foreignKey
      };
      newAssociation[type] = true;
      newAssociation.select = select;


      if (conditions) {
        newAssociation.conditions = conditions;
      }

      newAssociation.as = as || table

      if (join) {

        const { type = 'INNER', tableJoin = null, fieldJoin = null, fieldTable = null } = join

        if (!tableJoin && !fieldJoin && !fieldTable) {
          throw new Error('Put all association join fields!');
        }

        newAssociation.join = `${type} JOIN ${tableJoin} ON ${tableJoin}.${fieldJoin} = ${table}.${fieldTable}`;
      }

      associations.push(newAssociation)

      return this;
    },
    innnerJoin(tableJoin, fieldJoin, fieldTable) {
      query += ` INNER JOIN ${tableJoin} ON ${tableJoin}.${fieldJoin} = ${table}.${fieldTable}`;
      return this;
    },
    andWhere(filter) {
      const symbolRegex = /[<>]|like/gm;
      let symbol = '=';

      for (let [key, value] of Object.entries(filter)) {
        if (typeof value === 'string') {
          const findSymbol = value.match(symbolRegex);
          if (findSymbol) {
            symbol = findSymbol.join('');
            value = value.replace(symbol, '');
            value = value.trim();
          }
        }

        if (!hasWhere) {
          if (typeof value === 'string') {
            query += ` where ${key} ${symbol} '${value}'`;
          } else {
            query += ` where ${key} ${symbol} ${value}`;
          }
          hasWhere = true;
        } else {
          if (typeof value === 'string') {
            query += ` and ${key} ${symbol} '${value}'`;
          } else {
            query += ` and ${key} ${symbol} ${value}`;
          }
        }
      }

      queryToCount = query;

      return this;
    },
    orWhere(filter) {
      const symbolRegex = /[<>]|like/gm;
      let symbol = '=';

      for (let [key, value] of Object.entries(filter)) {
        if (typeof value === 'string') {
          const findSymbol = value.match(symbolRegex);
          if (findSymbol) {
            symbol = findSymbol.join('');
            value = value.replace(symbol, '');
            value = value.trim();
          }
        }

        if (!hasWhere) {
          if (typeof value === 'string') {
            query += ` where ${key} ${symbol} '${value}'`;
          } else {
            query += ` where ${key} ${symbol} ${value}`;
          }
          hasWhere = true;
        } else {
          if (typeof value === 'string') {
            query += ` or ${key} ${symbol} '${value}'`;
          } else {
            query += ` or ${key} ${symbol} ${value}`;
          }
        }
      }

      queryToCount = query;

      return this;
    },
    async insert(params = {}, returnField = null) {
      const keys = Object.keys(params);

      if (keys.length === 0) {
        throw new Error('Não é possível fazer inserção sem parâmetros!');
      }

      const values = Object.values(params);

      let query = `INSERT INTO ${table} (`;

      for (let index = 0; index < keys.length; index++) {
        const key = keys[index];
        const comma = index + 1 === keys.length ? ')' : ',';
        query += `${key}${comma}`;
      }

      if (returnField) {
        query += ` OUTPUT Inserted.${returnField}`;
      }

      query += ' VALUES (';

      for (let index = 0; index < values.length; index++) {
        const value = values[index];
        const comma = index + 1 === values.length ? ')' : ',';
        query += `'${value}'${comma}`;
      }

      const instance = await initDb();
      const result = await instance.query(query);

      if (!returnField) {
        return result?.rowsAffected[0] === 1;
      }

      return result?.recordset[0];
    },
    orderBy(byField, sort = 'asc') {
      query += ` ORDER BY ${byField} ${sort}`;
      return this;
    },
    paginate(offset, limit) {
      query += ` OFFSET ${offset} ROWS FETCH NEXT ${limit} ROWS ONLY`;
      return this;
    },
    async count(alias = 'total', filed = '*') {
      const instance = await initDb();
      const result = await instance.query(
        `SELECT COUNT (${filed}) as ${alias} FROM ${table}`
      );
      return result.recordsets[0] ? result.recordsets[0][0] : null;
    },
    async execute() {
      const instance = await initDb();
      const result = await instance.query(query);
      query = null;
      hasWhere = false;
      let data = null;

      if (!result?.recordsets) {
        return null;
      }

      if (Array.isArray(result?.recordsets[0])) {
        data = result?.recordsets[0];

        if (associations.length > 0 ) {
          for await (const association of associations) {
            for (let index = 0; index < data.length; index++) {
              const key = data[index][association.localKey];
              if (association.hasMany) {
                let query = `SELECT ${association.select} from ${association.table}`

                if (association.join) {
                  query += ` ${association.join}`
                }

                query += ` where ${association.table}.${association.foreignKey} = ${key}`;

                if (association.conditions) {
                  query += ` ${association.conditions}`
                }
                const resultAssociation = await instance.query(query);

                if (resultAssociation?.recordsets) {
                  data[index][association.as] = resultAssociation?.recordsets[0];
                }
              }
            }
          }
        }
      } else {
        data = result.recordsets[0][0];

        for (const association of associations) {
          const key = data[association.localKey];
          if (association.hasMany) {
            const query = `SELECT ${association.filter} from ${association.table} where ${association.foreignKey} = ${key}`
            const resultAssociation = await instance.query(query);
            if(resultAssociation?.recordsets) {
              data[associationarguments.as] = resultAssociation?.recordsets[0]
            }
          }
        }
      }

      associations = []
      return {
        data,
        async count(alias = 'count', fields = '*') {
          const splitQuery = queryToCount.split(/from/);
          const countQuery = `select count(${fields}) as ${alias} from ${splitQuery[1]}`;
          const resultCount = await instance.query(countQuery);
          queryToCount = null;
          return resultCount.recordsets[0][0];
        }
      };
    }
  };
};
