module.exports = (ctx, req, res) => {
   if (process.env.USERNAME === 'eternal') {
      ctx.restart();
      res.statusCode = 200;
   } else {
      res.statusCode = 401;
   }

   res.end();
};