declare module "express-mysql-session" {
  import { Pool } from "mysql2";
  import session from "express-session";

  interface MySQLStoreOptions {
    schema?: {
      tableName?: string;
      columnNames?: {
        session_id?: string;
        expires?: string;
        data?: string;
      };
    };
    clearExpired?: boolean;
    checkExpirationInterval?: number;
    expiration?: number;
    createDatabaseTable?: boolean;
    connectionLimit?: number;
    endConnectionOnClose?: boolean;
    charset?: string;
    clearExpired?: boolean;
  }

  function MySQLStore(session: typeof session): {
    new (options?: MySQLStoreOptions, connection?: Pool): session.Store;
  };

  export default MySQLStore;
}
