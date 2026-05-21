// TypeScript declaration for the 'postgres' npm package
declare module 'postgres' {
  interface Options {
    prepare?: boolean;
    // Any other options you need can be added here
  }
  type Sql = any; // The client returned by the library is a function that can be called as a tagged template literal.
  const postgres: (connectionString: string, options?: Options) => Sql;
  export default postgres;
}
