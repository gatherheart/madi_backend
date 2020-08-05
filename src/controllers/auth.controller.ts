import { Request, Response, NextFunction } from 'express';
import User from "../models/user.model";
import { generateToken } from '../passport';
import * as jwt from 'jsonwebtoken'

export const signin = (req:Request, res:Response) => {
    User.findOne({
      "email": req.body.email
    }, (err, user) => {
  
      if (err || !user)
        return res.status(401).json({
          error: "User not found"
        })
  
      if (!user.authenticate(req.body.password)) {
        return res.status(401).send({
          error: "Email and password don't match."
        })
      }
  
      const token = jwt.sign({
        _id: user._id
      }, process.env.JWT_SECRET || 'secret')

      let expiryDate = new Date(Number(new Date()) + 24 * 60 * 60 * 1000); 

      res.cookie("NID_AUT", token, {
        expires: expiryDate
      })
  
      return res.json({
        token,
        user: {_id: user._id, name: user.name, email: user.email}
      })
  
    })
  }


export const facebookLogin = function (req: Request, res: Response, next: NextFunction) {

    const { username, email, id } = req.query;
    if (
      typeof username !== "string" ||
      typeof email !== "string" ||
      typeof id !== "string"
    )
      return res.json({ message: "Error", user: req.user });

    User.findOne(
      {
        facebookId: id,
      },
      function (err, user) {
        if (err) {
          return next(err);
        }

        const accessToken = generateToken(id, username);
        const refreshToken = generateToken(new Date().toDateString(), id);

        if (!user) {
          user = new User({
            name: username,
            email: email,
            facebookId: id,
            provider: "facebook",
            created: new Date(),
            refreshToken: refreshToken,
          });

          user.save(function (err) {
            if (err) {
              console.log(err);
            }
            return { accessToken, refreshToken };
          });
        } else {
          return { accessToken, refreshToken };
        }
      }
    );
  }