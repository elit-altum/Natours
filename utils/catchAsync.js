/*
This wrapper function enforces a personal programming paradigm of using promises returned by 
async request handlers for error handling instead of the try-catch blocks.

It gets called with an async route handler (fn) of an express route. As it is async, it would reject it's
promise. This is then sent to the express error handler using next().

It returns a function which would then actually be called by express with req,res,next as the route
handler. It would then pass these parameters to the child function which actually works with it. 

*/

module.exports = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch((err) => next(err));
  };
};
