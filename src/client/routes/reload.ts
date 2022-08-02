import { Owners } from '@common/constants';
import { Users } from '@webpack/stores';

export function post(instance, req, res) {
   const user = Users.getCurrentUser();

   if (user?.id && ~Object.values(Owners).indexOf(user.id)) {
      instance.restart();
      res.statusCode = 200;
   } else {
      res.statusCode = 401;
   }

   res.end();
};