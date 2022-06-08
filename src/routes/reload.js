const { Users } = require('@webpack/stores');

const eligible = [
   // eternal#1000
   '263689920210534400',
   // Swishilicous#5308
   '474322346937810955'
];

module.exports = (ctx, _, res) => {
   const user = Users.getCurrentUser?.()?.id;

   if (user && eligible.includes(user)) {
      ctx.restart();
      res.statusCode = 200;
   } else {
      res.statusCode = 401;
   }

   res.end();
};